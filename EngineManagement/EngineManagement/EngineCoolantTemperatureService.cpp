#include <stm32f10x_gpio.h>
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "IEngineCoolantTemperatureService.h"
#include "IAnalogService.h"
#include "EngineCoolantTemperatureService.h"

#define MAP_READ_TASK_PRIORITY 3

namespace EngineManagement
{	
	EngineCoolantTemperatureService::EngineCoolantTemperatureService(HardwareAbstraction::ITimerService *timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config)
	{
		_timerService = timerService;
		_analogService = analogService;
		
		_adcPin = adcPin;
		_analogService->InitPin(_adcPin);
		
		LoadConfig(config);
	}
	
	void EngineCoolantTemperatureService::LoadConfig(void *config)
	{
		MaxEngineCoolantTemperature = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A0 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A1 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A2 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A3 = *((float *)config);
		config = (void*)((float *)config + 1);
	}
	
	void EngineCoolantTemperatureService::ReadEct()
	{
		float prevEct = EngineCoolantTemperature;
		unsigned short adcValue = _analogService->ReadPin(_adcPin);
		EngineCoolantTemperature = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
		unsigned int readTick = _timerService->GetTick();
		//if ther hasn't been a full tick between reads then return;
		if(_lastReadTick == readTick)
			return;
		EngineCoolantTemperatureDerivative = ((EngineCoolantTemperature - prevEct) / (_lastReadTick - readTick)) * _timerService->GetTicksPerSecond();
		_lastReadTick = readTick;
	}
}