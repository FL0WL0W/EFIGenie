#include "Services.h"
#include "SensorService_Frequency.h"

#ifdef SensorService_FrequencyExists
namespace EngineManagement
{	
	SensorService_Frequency::SensorService_Frequency(const SensorService_FrequencyConfig *config)
	{
		_config = config;
				
		CurrentPwmService->InitPin(_config->PwmPin, HardwareAbstraction::In, _config->MinFrequency);
	}
	
	void SensorService_Frequency::ReadValue()
	{
		HardwareAbstraction::PwmValue pwmValue = CurrentPwmService->ReadPin(_config->PwmPin);
		
		if (pwmValue.Period <= 0)
			return;

		float frequency = 1 / pwmValue.Period;
		
		float value = _config->A3 * frequency * frequency * frequency + _config->A2 * frequency * frequency + _config->A1 * frequency + _config->A0;
		if (value < _config->MinValue)
			value = _config->MinValue;
		else if (value > _config->MaxValue)
			value = _config->MaxValue;
		Value = value;
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
		if (readTick < (lastReadTick + CurrentTimerService->GetTicksPerSecond() / _config->DotSampleRate))
			return;
		ValueDot = ((Value - _lastValue) / (readTick - lastReadTick)) * CurrentTimerService->GetTicksPerSecond();
		_lastReadTick = readTickOrig;
		_lastValue = Value;
	}
}
#endif