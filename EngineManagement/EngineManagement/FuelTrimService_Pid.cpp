#include "Services.h"
#include "FuelTrimService_Pid.h"

#ifdef FuelTrimService_PidExists
namespace EngineManagement
{
	FuelTrimService_Pid::FuelTrimService_Pid(void *config)
	{
		//TODO: config
	}
	
	short FuelTrimService_Pid::GetFuelTrim(unsigned char cylinder)
	{
		return _fuelTrim;
	}
	
	void FuelTrimService_Pid::TrimTick()
	{
		if (CurrentAfrService->Lambda < 1 + _lambdaDeltaEnable || CurrentAfrService->Lambda > 1 - _lambdaDeltaEnable)
		{			
			unsigned int origTick = CurrentTimerService->GetTick();
			unsigned int tick = origTick;
			unsigned int lastTick = _lastTick;
			if (tick < lastTick)
			{
				lastTick += 2147483647;
				tick += 2147483647;
			}
			unsigned int elapsedTick = (lastTick - tick);
			
			if (elapsedTick < tickRate)
				return;
			
			_lastTick = lastTick;
			
			float error = CurrentAfrService->Lambda - _lambdaSensorService->Lambda;
			
			float elapsedTime = ((float)elapsedTick / CurrentTimerService->GetTicksPerSecond());
			
			_integral += error * elapsedTime;
			
			float derivative = (error - _lastError) / elapsedTime;
			
			_lastError = error;
			
			_fuelTrim = _kP * error + _kI * _integral + _kD * derivative;
		}
		else
		{
			_fuelTrim = 0;
		}
	}
}
#endif 
