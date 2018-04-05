#include "Services.h"
#include "SensorService_Analog.h"

#ifdef SensorService_AnalogExists
namespace EngineManagement
{	
	SensorService_Analog::SensorService_Analog(const SensorService_AnalogConfig *config)
	{
		_config = config;
		
		CurrentAnalogService->InitPin(_config->AdcPin);
	}
	
	void SensorService_Analog::ReadValue()
	{
		float adcValue = CurrentAnalogService->ReadPin(_config->AdcPin);
		float value = _config->A3 * adcValue * adcValue * adcValue + _config->A2 * adcValue * adcValue + _config->A1 * adcValue + _config->A0;
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