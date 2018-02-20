#include "Services.h"
#include "IntakeAirTemperatureService_Analog.h"

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
		IntakeAirTemperatureDot = ((IntakeAirTemperature - _lastIat) / (readTick - _lastReadTick)) * CurrentTimerService->GetTicksPerSecond();
		_lastReadTick = readTickOrig;
		_lastIat = IntakeAirTemperature;
	}
}