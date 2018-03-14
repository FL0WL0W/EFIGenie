#include "Services.h"
#include "SensorService_Frequency.h"

#ifdef SensorService_FrequencyExists
namespace EngineManagement
{	
	SensorService_Frequency::SensorService_Frequency(void *config)
	{
		_pwmPin = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		A0 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A1 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A2 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A3 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		_dotSampleRate = *((unsigned short *)config);
		config = (void*)((unsigned short *)config + 1);
		
		MaxValue = *((float *)config);
		config = (void*)((float *)config + 1);
		
		MinValue = *((float *)config);
		config = (void*)((float *)config + 1);
		
		unsigned short minFrequency = *((unsigned short *)config);
		config = (void*)((unsigned short *)config + 1);
		
		CurrentPwmService->InitPin(_pwmPin, HardwareAbstraction::In, minFrequency);
	}
	
	void SensorService_Frequency::ReadValue()
	{
		HardwareAbstraction::PwmValue pwmValue = CurrentPwmService->ReadPin(_pwmPin);
		
		if (pwmValue.Period <= 0)
			return;

		float frequency = 1 / pwmValue.Period;
		
		float value = A3 * frequency * frequency * frequency + A2 * frequency * frequency + A1 * frequency + A0;
		if (value < MinValue)
			value = MinValue;
		else if (value > MaxValue)
			value = MaxValue;
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
		if (readTick < (lastReadTick + CurrentTimerService->GetTicksPerSecond() / _dotSampleRate))
			return;
		ValueDot = ((Value - _lastValue) / (readTick - lastReadTick)) * CurrentTimerService->GetTicksPerSecond();
		_lastReadTick = readTickOrig;
		_lastValue = Value;
	}
}
#endif