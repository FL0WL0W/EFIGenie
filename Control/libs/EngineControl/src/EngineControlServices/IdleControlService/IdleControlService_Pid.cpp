#include "EngineControlServices/IdleControlService/IdleControlService_Pid.h"
#include "Interpolation.h"

using namespace Interpolation;

#ifdef IDLECONTROLSERVICE_PID_H
namespace EngineControlServices
{
	IdleControlService_Pid::IdleControlService_Pid(
		const IdleControlService_PidConfig *config, 
		const HardwareAbstractionCollection *hardwareAbstractionCollection, 
		RpmService *rpmService, 
		IFloatInputService *throttlePositionService, 
		IFloatInputService *engineCoolantTemperatureService, 
		IFloatInputService *vehicleSpeedService,
		IFloatInputService *intakeAirTemperatureService, 
		IFloatInputService *manifoldAbsolutePressureService,
		IFloatOutputService *idleAirControlValveService)
	{
		_config = config;
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_rpmService = rpmService;
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
		
		unsigned short rpm = _rpmService->Rpm;
		
		float dt = _hardwareAbstractionCollection->TimerService->GetElapsedTime(_lastReadTick);
		if (dt * _config->DotSampleRate < 1)
			return;
		_lastReadTick = _hardwareAbstractionCollection->TimerService->GetTick();
		
		const InterpolationResponse ectInterpolation = Interpolate(_engineCoolantTemperatureService->Value, _config->MaxEct, _config->MinEct, _config->EctResolution);
		float idleAirmass = InterpolateTable1<float>(ectInterpolation, _config->IdleAirmass());
		unsigned short idleTargetRpm = InterpolateTable1<unsigned short>(ectInterpolation, _config->IdleTargetRpm());
		
		if (_vehicleSpeedService != 0)
		{
			const InterpolationResponse speedtInterpolation = Interpolate(_vehicleSpeedService->Value, _config->SpeedThreshold, 0, _config->SpeedResolution);
			idleAirmass += InterpolateTable1<float>(speedtInterpolation, _config->IdleAirmassSpeedAdder());
			idleTargetRpm += InterpolateTable1<unsigned short>(speedtInterpolation, _config->IdleTargetRpmSpeedAdder());
		}
		
		short thisRpmError = idleTargetRpm - rpm;
		int rpmErrorDot = (int)round((thisRpmError - RpmError) / dt);
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
		float airDensity = (100 * 1000) /*assuming 1 bar at throttlebody*/ / ((_config->GasConstant / 10.0f) * (temperature + 273.15f));   // kg/m^3
		airDensity *= 1000000; //g/mm^3
		
		float pressure = 500000; // default to 50 kpa
		if (_manifoldAbsolutePressureService != 0)
			pressure = _manifoldAbsolutePressureService->Value * 1000000;  //g/mm^3
		
		float idleAirArea = idleAirmass / sqrt(2*pressure*airDensity);
		
		_idleAirControlValveService->SetOutput(idleAirArea);
	}
}
#endif 
