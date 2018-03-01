#include "Services.h"
#include "IntakeAirTemperatureService_Analog.h"

#ifdef IntakeAirTemperatureService_AnalogExists
namespace EngineManagement
{	
	IntakeAirTemperatureService_Analog::IntakeAirTemperatureService_Analog(void *config)
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
	
	void IntakeAirTemperatureService_Analog::ReadIat()
	{
		float adcValue = CurrentAnalogService->ReadPin(_adcPin);
		IntakeAirTemperature = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
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
		IntakeAirTemperatureDot = ((IntakeAirTemperature - _lastIat) / (readTick - lastReadTick)) * CurrentTimerService->GetTicksPerSecond();
		_lastReadTick = readTickOrig;
		_lastIat = IntakeAirTemperature;
	}
}
#endif