#include "IdleControlService_Pid.h"
#include "math.h"
#include "Interpolation.h"

using namespace Interpolation;

#ifdef IDLECONTROLSERVICE_PID_H
namespace ApplicationService
{
	IdleControlService_Pid::IdleControlService_Pid(
		const IdleControlService_PidConfig *config, 
		const HardwareAbstractionCollection *hardwareAbstractionCollection, 
		IDecoder *decoder, 
		IFloatInputService *throttlePositionService, 
		IFloatInputService *engineCoolantTemperatureService, 
		IFloatInputService *vehicleSpeedService,
		IFloatInputService *intakeAirTemperatureService, 
		IFloatInputService *manifoldAbsolutePressureService,
		IFloatOutputService *idleAirControlValveService)
	{
		_config = config;
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_decoder = decoder;
		_engineCoolantTemperatureService = engineCoolantTemperatureService;
		_vehicleSpeedService = vehicleSpeedService;
		_intakeAirTemperatureService = intakeAirTemperatureService;
		_manifoldAbsolutePressureService = manifoldAbsolutePressureService;
		_idleAirControlValveService = idleAirControlValveService;
	}
	
	void IdleControlService_Pid::Tick()
	{
		if (_throttlePositionService != 0 && _throttlePositionService->Value > _config->TpsThreshold)
		{
			//no longer have error since we are out of the threshold
			RpmError = 0;
			return;
		}
		
		if (_vehicleSpeedService != 0 && _vehicleSpeedService->Value > _config->SpeedThreshold)
		{
			//no longer have error since we are out of the threshold
			RpmError = 0;
			return;
		}
		
		unsigned short rpm = _decoder->GetRpm();
		
		//TODO REPLACE THIS WITH FUNCTION
		unsigned int readTickOrig = _hardwareAbstractionCollection->TimerService->GetTick();
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
		if (readTick < (lastReadTick + _hardwareAbstractionCollection->TimerService->GetTicksPerSecond() / _config->DotSampleRate))
			return;
		float dt = (readTick - lastReadTick) / (float)_hardwareAbstractionCollection->TimerService->GetTicksPerSecond();
		_lastReadTick = readTickOrig;
		
		InterpolationResponse ectInterpolation = Interpolate(_engineCoolantTemperatureService->Value, _config->MaxEct, _config->MinEct, _config->EctResolution);
		float idleAirmass = _config->IdleAirmass[ectInterpolation.IndexL] * (1 - ectInterpolation.Multiplier) + _config->IdleAirmass[ectInterpolation.IndexH] * ectInterpolation.Multiplier;
		unsigned short idleTargetRpm = _config->IdleTargetRpm[ectInterpolation.IndexL] * (1 - ectInterpolation.Multiplier) + _config->IdleTargetRpm[ectInterpolation.IndexH] * ectInterpolation.Multiplier;
		
		if (_vehicleSpeedService != 0)
		{
			InterpolationResponse speedtInterpolation = Interpolate(_vehicleSpeedService->Value, _config->SpeedThreshold, 0, _config->SpeedResolution);
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
		if (_intakeAirTemperatureService != 0)
			temperature = _intakeAirTemperatureService->Value;
		float airDensity = (100 * 1000) /*assuming 1 bar at throttlebody*/ / ((_config->GasConstant / 10.0f) * (temperature + 273.15));   // kg/m^3
		airDensity *= 1000000; //g/mm^3
		
		float pressure = 500000; // default to 50 kpa
		if (_manifoldAbsolutePressureService != 0)
			pressure = _manifoldAbsolutePressureService->Value * 1000000;  //g/mm^3
		
		float idleAirArea = idleAirmass / sqrt(2*pressure*airDensity);
		
		_idleAirControlValveService->SetOutput(idleAirArea);
	}
}
#endif 
