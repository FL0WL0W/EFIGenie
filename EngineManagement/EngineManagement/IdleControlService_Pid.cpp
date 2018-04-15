#include "IdleControlService_Pid.h"
#include "math.h"
#include "Functions.h"

#ifdef IDLECONTROLSERVICE_PID_H
namespace EngineManagement
{
	IdleControlService_Pid::IdleControlService_Pid(const IOServiceLayer::IOServiceCollection *iOServiceCollection, const IdleControlService_PidConfig *config)
	{
		_IOServiceCollection = iOServiceCollection;
		_config = config;
	}
	
	void IdleControlService_Pid::Tick()
	{
		if (_IOServiceCollection->ThrottlePositionService != 0 && _IOServiceCollection->ThrottlePositionService->Value > _config->TpsThreshold)
		{
			//no longer have error since we are out of the threshold
			RpmError = 0;
			return;
		}
		
		if (_IOServiceCollection->VehicleSpeedService != 0 && _IOServiceCollection->VehicleSpeedService->Value > _config->SpeedThreshold)
		{
			//no longer have error since we are out of the threshold
			RpmError = 0;
			return;
		}
		
		unsigned short rpm = _IOServiceCollection->Decoder->GetRpm();
		
		//TODO REPLACE THIS WITH FUNCTION
		unsigned int readTickOrig = _IOServiceCollection->HardwareAbstractionCollection->TimerService->GetTick();
		unsigned int lastReadTick = _lastReadTick;
		//if ther hasn't been a full tick between reads then return;
		if(lastReadTick == readTickOrig)
			return;
		unsigned int readTick = readTickOrig;
		if (readTick < lastReadTick)
		{
			lastReadTick += 2147483647;
			readTick += 2147483647;
		}
		if (readTick < (lastReadTick + _IOServiceCollection->HardwareAbstractionCollection->TimerService->GetTicksPerSecond() / _config->DotSampleRate))
			return;
		float dt = (readTick - lastReadTick) / (float)_IOServiceCollection->HardwareAbstractionCollection->TimerService->GetTicksPerSecond();
		_lastReadTick = readTickOrig;
		
		InterpolationResponse ectInterpolation = Interpolate(_IOServiceCollection->EngineCoolantTemperatureService->Value, _config->MaxEct, _config->MinEct, _config->EctResolution);
		float idleAirmass = _config->IdleAirmass[ectInterpolation.IndexL] * (1 - ectInterpolation.Multiplier) + _config->IdleAirmass[ectInterpolation.IndexH] * ectInterpolation.Multiplier;
		unsigned short idleTargetRpm = _config->IdleTargetRpm[ectInterpolation.IndexL] * (1 - ectInterpolation.Multiplier) + _config->IdleTargetRpm[ectInterpolation.IndexH] * ectInterpolation.Multiplier;
		
		if (_IOServiceCollection->VehicleSpeedService != 0)
		{
			InterpolationResponse speedtInterpolation = Interpolate(_IOServiceCollection->VehicleSpeedService->Value, _config->SpeedThreshold, 0, _config->SpeedResolution);
			idleAirmass += _config->IdleAirmassSpeedAdder[speedtInterpolation.IndexL] * (1 - speedtInterpolation.Multiplier) + _config->IdleAirmassSpeedAdder[speedtInterpolation.IndexH] * speedtInterpolation.Multiplier;
			idleTargetRpm += _config->IdleTargetRpmSpeedAdder[speedtInterpolation.IndexL] * (1 - speedtInterpolation.Multiplier) + _config->IdleTargetRpmSpeedAdder[speedtInterpolation.IndexH] * speedtInterpolation.Multiplier;
		}
		
		short thisRpmError = idleTargetRpm - rpm;
		int rpmErrorDot = (thisRpmError - RpmError) / dt;
		RpmError = thisRpmError;
		_integral += RpmError * _config->I * dt;

		if (_integral > _config->MaxIntegral)
			_integral = _config->MaxIntegral;
		else if (_integral < _config->MinIntegral)
			_integral = _config->MinIntegral;

		idleAirmass += _config->P * RpmError - _config->D * rpmErrorDot + _integral;
		
		float temperature = 30;
		if (_IOServiceCollection->IntakeAirTemperatureService != 0)
			temperature = _IOServiceCollection->IntakeAirTemperatureService->Value;
		float airDensity = (100 * 1000) /*assuming 1 bar at throttlebody*/ / ((_config->GasConstant / 10.0f) * (temperature + 273.15));   // kg/m^3
		airDensity *= 1000000; //g/mm^3
		
		float pressure = 500000; // default to 50 kpa
		if (_IOServiceCollection->ManifoldAbsolutePressureService != 0)
			pressure = _IOServiceCollection->ManifoldAbsolutePressureService->Value * 1000000;  //g/mm^3
		
		float idleAirArea = idleAirmass / sqrt(2*pressure*airDensity);
		
		_IOServiceCollection->IdleAirControlValveService->SetOutput(idleAirArea);
	}
}
#endif 
