#include "Services.h"
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
			return;
		
		if (CurrentVehicleSpeedSensorService != 0 && CurrentVehicleSpeedSensorService->Value > _speedThreshold)
			return;
		
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
		
		unsigned char ectIndexL = 0;
		unsigned char ectIndexH = 0;
		float ectMultiplier = 0;
		if (_ectResolution > 1)
		{
			float ect = CurrentEngineCoolantTemperatureService->Value;
			float ectDivision = (_maxEct - _minEct) / (_ectResolution - 1);
			ectIndexL = (ect - _minEct) / ectDivision;
			ectIndexH = ectIndexL + 1;
			ectMultiplier = (ect - _minEct) / ectDivision - ectIndexL;
			if (ectIndexL > _ectResolution - 1)
			{
				ectIndexL = ectIndexH = _ectResolution - 1;
			}
			else if (ectIndexH > _ectResolution - 1)
			{
				ectIndexH = _ectResolution - 1;
			}
		}
		float idleAirmass = _idleAirmass[ectIndexL] * (1 - ectMultiplier) + _idleAirmass[ectIndexH] * ectMultiplier;
		unsigned short idleTargetRpm = _idleTargetRpm[ectIndexL] * (1 - ectMultiplier) + _idleTargetRpm[ectIndexH] * ectMultiplier;
		
		if (CurrentVehicleSpeedSensorService != 0)
		{
			unsigned char speedIndexL = 0;
			unsigned char speedIndexH = 0;
			float speedMultiplier = 0;
			if (_speedResolution > 1)
			{
				float speed = CurrentVehicleSpeedSensorService->Value;
				float speedDivision = _speedThreshold / (_speedResolution - 1);
				speedIndexL = speed / speedDivision;
				speedIndexH = speedIndexL + 1;
				ectMultiplier =  speed / speedDivision - speedIndexL;
				if (speedIndexL > _speedResolution - 1)
				{
					speedIndexL = speedIndexH = _speedResolution - 1;
				}
				else if (speedIndexH > _speedResolution - 1)
				{
					speedIndexH = _speedResolution - 1;
				}
			}
			idleAirmass += _idleAirmass[ectIndexL] * (1 - ectMultiplier) + _idleAirmass[ectIndexH] * ectMultiplier;
			idleTargetRpm += _idleTargetRpm[ectIndexL] * (1 - ectMultiplier) + _idleTargetRpm[ectIndexH] * ectMultiplier;
		}
		
		short thisRpmError = idleTargetRpm - rpm;
		unsigned int rpmErrorDot = (thisRpmError - RpmError) / dt;
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
