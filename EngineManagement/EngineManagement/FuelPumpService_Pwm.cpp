#include "Services.h"
#include "FuelPumpService_Pwm.h"

#ifdef FuelPumpService_PwmExists
namespace EngineManagement
{
	FuelPumpService_Pwm::FuelPumpService_Pwm(void *config)
	{
		_pin = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		_primeTime = *(float *)config * CurrentTimerService->GetTicksPerSecond();
		config = (void*)((float *)config + 1);
		
		unsigned char flags = (bool)(*(unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_normalOn = flags & 0x01;
		_useTps = flags & (0x01 << 1);
		
		_period = 1 / *(float *)config; //frequency in config
		config = (void*)((float *)config + 1);
		
		_primePwm = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		_maxRpm = 1 / *(unsigned short *)config; 
		config = (void*)((unsigned short *)config + 1);
		
		_maxy = 1 / *(float *)config; 
		config = (void*)((float *)config + 1);
		
		_rpmResolution = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		_yResolution = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		_pwmTable = (unsigned char *)config;
		config = (void*)((unsigned char *)config + _rpmResolution * _yResolution);

		CurrentPwmService->InitPin(_pin, HardwareAbstraction::Out, 1 / _period);
		
		Off();
	}
	
	void FuelPumpService_Pwm::Off()
	{
		_isOn = false;
		if (_normalOn)
		{
			CurrentPwmService->WritePin(_pin, { _period, _period });
		}
		else
		{
			CurrentPwmService->WritePin(_pin, { _period, 0 });
		}
	}
	
	void FuelPumpService_Pwm::On()
	{
		_isOn = true;
		Started = true;
		if (_normalOn)
		{
			CurrentPwmService->WritePin(_pin, { _period, _period * (1 - _currentPwm / 255.0f) });
		}
		else
		{
			CurrentPwmService->WritePin(_pin, { _period, _period * (_currentPwm / 255.0f) });
		}
	}
	
	void FuelPumpService_Pwm::Prime()
	{
		_currentPwm = _primePwm;
		if (_normalOn)
		{
			CurrentPwmService->WritePin(_pin, { _period, _period * (1 - _currentPwm / 255.0f) });
		}
		else
		{
			CurrentPwmService->WritePin(_pin, { _period, _period * (_currentPwm / 255.0f) });
		}
		
		CurrentTimerService->ScheduleTask(&FuelPumpService_Pwm::PrimeTaskOff, this, _primeTime + CurrentTimerService->GetTick(), true);
	}
	
	void FuelPumpService_Pwm::PrimeTaskOff(void *parameter)
	{
		FuelPumpService_Pwm *service = ((FuelPumpService_Pwm *)parameter);
		if (!service->Started)
			service->Off();
	}
	
	void FuelPumpService_Pwm::Tick()
	{	
		if (!_isOn)
			return;
		
		unsigned char rpmIndexL = 0;
		unsigned char rpmIndexH = 0;
		float rpmMultiplier = 0;
		if (_yResolution > 1)
		{
			unsigned short rpm = CurrentDecoder->GetRpm();
			unsigned short rpmDivision = _maxRpm / _rpmResolution;
			unsigned char rpmIndexL = rpm / rpmDivision;
			unsigned char rpmIndexH = rpmIndexL + 1;
			float rpmMultiplier = (rpm + 0.0f) / rpmDivision - rpmIndexL;
			if (rpmIndexL > _rpmResolution - 1)
			{
				rpmIndexL = rpmIndexH = _rpmResolution - 1;
			}
			else if (rpmIndexH > _rpmResolution - 1)
			{
				rpmIndexH = _rpmResolution - 1;
			}
		}
			
		unsigned char yIndexL = 0;
		unsigned char yIndexH = 0;
		float yMultiplier = 0;
		if (_yResolution > 1 && CurrentThrottlePositionService != 0 && CurrentManifoldAbsolutePressureService != 0)
		{
			float y = 0;
			if (_useTps && CurrentThrottlePositionService != 0)
			{
				y = CurrentThrottlePositionService->Value;
			}
			else if (CurrentManifoldAbsolutePressureService != 0)
			{
				y = CurrentManifoldAbsolutePressureService->Value;
			}
			float yDivision = _maxy / _yResolution;
			yIndexL = y / yDivision;
			yIndexH = yIndexL + 1;
			yMultiplier = (y + 0.0f) / yDivision - yIndexL;
			if (yIndexL > _yResolution - 1)
			{
				yIndexL = yIndexH = _yResolution - 1;
			}
			else if (yIndexH > _yResolution - 1)
			{
				yIndexH = _yResolution - 1;
			}
		}
		
		short _currentPwm = _pwmTable[rpmIndexL + _rpmResolution * yIndexL] * rpmMultiplier * yMultiplier
		+					_pwmTable[rpmIndexH + _rpmResolution * yIndexL] * (1 - rpmMultiplier) * yMultiplier
		+					_pwmTable[rpmIndexL + _rpmResolution * yIndexH] * rpmMultiplier * (1 - yMultiplier)
		+					_pwmTable[rpmIndexH + _rpmResolution * yIndexH] * (1 - rpmMultiplier) * (1 - yMultiplier);
		
		On();
	}
}
#endif