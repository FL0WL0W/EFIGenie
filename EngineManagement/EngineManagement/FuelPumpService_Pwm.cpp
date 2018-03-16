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
		
		_normalOn = (bool)(*(unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_period = 1 / *(float *)config; //frequency in config
		config = (void*)((float *)config + 1);
		
		_primePwm = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		_maxRpm = 1 / *(unsigned short *)config; 
		config = (void*)((unsigned short *)config + 1);
		
		_maxMap = 1 / *(float *)config; 
		config = (void*)((float *)config + 1);
		
		_rpmResolution = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		_mapResolution = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		_pwmTable = (unsigned char *)config;
		config = (void*)((unsigned char *)config + _rpmResolution * _mapResolution);

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
		if (_mapResolution > 1)
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
			
		unsigned char mapIndexL = 0;
		unsigned char mapIndexH = 0;
		float mapMultiplier = 0;
		if (_mapResolution > 1)
		{
			unsigned short map = CurrentManifoldAbsolutePressureService->Value;
			unsigned short mapDivision = _maxMap / _mapResolution;
			mapIndexL = map / mapDivision;
			mapIndexH = mapIndexL + 1;
			mapMultiplier = (map + 0.0f) / mapDivision - mapIndexL;
			if (mapIndexL > _mapResolution - 1)
			{
				mapIndexL = mapIndexH = _mapResolution - 1;
			}
			else if (mapIndexH > _mapResolution - 1)
			{
				mapIndexH = _mapResolution - 1;
			}
		}
		
		short _currentPwm = _pwmTable[rpmIndexL + _rpmResolution * mapIndexL] * rpmMultiplier * mapMultiplier
		+					_pwmTable[rpmIndexH + _rpmResolution * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
		+					_pwmTable[rpmIndexL + _rpmResolution * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
		+					_pwmTable[rpmIndexH + _rpmResolution * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
		
		On();
	}
}
#endif