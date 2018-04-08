#include "Services.h"
#include "Functions.h"
#include "IdleControlService_Pd.h"
#include "math.h"

#ifdef IdleControlService_PdExists
namespace EngineManagement
{
	IdleControlService_Pd::IdleControlService_Pd(void *config)
	{
		//TODO: Config
	}
	
	void IdleControlService_Pd::Tick()
	{
		if (CurrentThrottlePositionService != 0 && CurrentThrottlePositionService->Value > _tpsThreshold)
		{
			//no longer have error since we are out of the threshold
			RpmError = 0;
			return;
		}
		
		if (CurrentVehicleSpeedSensorService != 0 && CurrentVehicleSpeedSensorService->Value > _speedThreshold)
		{
			//no longer have error since we are out of the threshold
			RpmError = 0;
			return;
		}
		
		unsigned short rpm = CurrentDecoder->GetRpm();
		unsigned int readTickOrig = CurrentTimerService->GetTick();
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
		if (readTick < (lastReadTick + CurrentTimerService->GetTicksPerSecond() / _dotSampleRate))
			return;
		float dt = (readTick - lastReadTick) / (float)CurrentTimerService->GetTicksPerSecond();
		_lastReadTick = readTickOrig;
		
		InterpolationResponse ectInterpolation = Interpolate(CurrentEngineCoolantTemperatureService->Value, _maxEct, _minEct, _ectResolution);
		float idleAirmass = _idleAirmass[ectInterpolation.IndexL] * (1 - ectInterpolation.Multiplier) + _idleAirmass[ectInterpolation.IndexH] * ectInterpolation.Multiplier;
		unsigned short idleTargetRpm = _idleTargetRpm[ectInterpolation.IndexL] * (1 - ectInterpolation.Multiplier) + _idleTargetRpm[ectInterpolation.IndexH] * ectInterpolation.Multiplier;
		
		if (CurrentVehicleSpeedSensorService != 0)
		{
			InterpolationResponse speedtInterpolation = Interpolate(CurrentVehicleSpeedSensorService->Value, _speedThreshold, 0, _speedResolution);
			idleAirmass += _idleAirmassSpeedAdder[speedtInterpolation.IndexL] * (1 - speedtInterpolation.Multiplier) + _idleAirmassSpeedAdder[speedtInterpolation.IndexH] * speedtInterpolation.Multiplier;
			idleTargetRpm += _idleTargetRpmSpeedAdder[speedtInterpolation.IndexL] * (1 - speedtInterpolation.Multiplier) + _idleTargetRpmSpeedAdder[speedtInterpolation.IndexH] * speedtInterpolation.Multiplier;
		}
		
		short thisRpmError = idleTargetRpm - rpm;
		int rpmErrorDot = (thisRpmError - RpmError) / dt;
		RpmError = thisRpmError;
		
		idleAirmass += _kP * thisRpmError + _kD * rpmErrorDot;
		
		float temperature = 30;
		if (CurrentIntakeAirTemperatureService != 0)
			temperature = CurrentIntakeAirTemperatureService->Value;
		float airDensity = (100 * 1000) /*assuming 1 bar at throttlebody*/ / ((_gasConstant / 10.0f) * (temperature + 273.15));   // kg/m^3
		airDensity *= 1000000; //g/mm^3
		
		float pressure = 500000; // default to 50 kpa
		if (CurrentManifoldAbsolutePressureService != 0)
			pressure = CurrentManifoldAbsolutePressureService->Value * 1000000;  //g/mm^3
		
		float idleAirArea = idleAirmass / sqrt(2*pressure*airDensity);
		
		CurrentIdleAirControlValveService->SetArea(idleAirArea);
	}
}
#endif 
