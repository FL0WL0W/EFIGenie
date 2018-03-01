#include "Services.h"
#include "VoltageService_Analog.h"

#ifdef VoltageService_AnalogExists
namespace EngineManagement
{	
	VoltageService_Analog::VoltageService_Analog(void *config)
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
		
		CurrentAnalogService->InitPin(_adcPin);
	}
	
	void VoltageService_Analog::ReadVoltage()
	{
		float adcValue = CurrentAnalogService->ReadPin(_adcPin);
		Voltage = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
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
		VoltageDot = ((Voltage - _lastVoltage) / (readTick - lastReadTick)) * CurrentTimerService->GetTicksPerSecond();
		_lastReadTick = readTick;
		_lastVoltage = Voltage;
	}
}
#endif