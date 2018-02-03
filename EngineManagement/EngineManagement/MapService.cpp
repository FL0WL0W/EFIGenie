#include <stm32f10x_gpio.h>
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "IMapService.h"
#include "IAnalogService.h"
#include "MapService.h"

#define MAP_READ_TASK_PRIORITY 3

namespace EngineManagement
{	
	MapService::MapService(HardwareAbstraction::ITimerService *timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config)
	{
		_timerService = timerService;
		_analogService = analogService;
		
		_adcPin = adcPin;
		_analogService->InitPin(_adcPin);
		
		LoadConfig(config);
	}
	
	void MapService::LoadConfig(void *config)
	{
		MaxMapKpa = *((float *)config);
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
	
	void MapService::ReadMap()
	{
		float prevMapKpa = MapKpa;
		float adcValue = _analogService->ReadPin(_adcPin);
		MapKpa = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
		unsigned int readTick = _timerService->GetTick();
		//if ther hasn't been a full tick between reads then return;
		if (_lastReadTick == readTick)
			return;
		MapKpaDerivative = ((MapKpa - prevMapKpa) / (_lastReadTick - readTick)) * _timerService->GetTicksPerSecond();
		_lastReadTick = readTick;
	}
}