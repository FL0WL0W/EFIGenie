#include "Services.h"
#include "TpsService_Analog.h"

#ifdef TpsService_AnalogExists
namespace EngineManagement
{	
	TpsService_Analog::TpsService_Analog(void *config)
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
	
	void TpsService_Analog::ReadTps()
	{
		float adcValue = CurrentAnalogService->ReadPin(_adcPin);
		Tps = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
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
		TpsDot = ((Tps - _lastTps) / (readTick - _lastReadTick)) * CurrentTimerService->GetTicksPerSecond();
		_lastReadTick = readTick;
		_lastTps = Tps;
	}
}
#endif