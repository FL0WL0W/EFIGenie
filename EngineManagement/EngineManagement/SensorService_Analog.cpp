#include "Services.h"
#include "SensorService_Analog.h"

#ifdef SensorService_AnalogExists
namespace EngineManagement
{	
	SensorService_Analog::SensorService_Analog(void *config)
	{
		_adcPin = *((unsigned char *)config);
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
		
		CurrentAnalogService->InitPin(_adcPin);
	}
	
	void SensorService_Analog::ReadValue()
	{
		float adcValue = CurrentAnalogService->ReadPin(_adcPin);
		float value = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
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