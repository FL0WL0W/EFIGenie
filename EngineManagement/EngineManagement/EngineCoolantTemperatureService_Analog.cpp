#include "Services.h"
#include "EngineCoolantTemperatureService_Analog.h"

namespace EngineManagement
{	
	EngineCoolantTemperatureService_Analog::EngineCoolantTemperatureService_Analog(unsigned char adcPin, void *config)
	{		
		_adcPin = adcPin;
		CurrentAnalogService->InitPin(_adcPin);
		
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
	}
	
	void EngineCoolantTemperatureService_Analog::ReadEct()
	{
		float prevEct = EngineCoolantTemperature;
		float adcValue = CurrentAnalogService->ReadPin(_adcPin);
		EngineCoolantTemperature = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
		unsigned int readTickOrig = CurrentTimerService->GetTick();
		//if ther hasn't been a full tick between reads then return;
		if(_lastReadTick == readTickOrig)
			return;
		unsigned int readTick = readTickOrig;
		if (readTick < _lastReadTick)
		{
			_lastReadTick = _lastReadTick + 2147483647;
			readTick += 2147483647;
		}
		if (readTick < (_lastReadTick + CurrentTimerService->GetTicksPerSecond() / _dotSampleRate))
			return;
		EngineCoolantTemperatureDot = ((EngineCoolantTemperature - prevEct) / (_lastReadTick - readTick)) * CurrentTimerService->GetTicksPerSecond();
		_lastReadTick = readTick;
	}
}