#include <stm32f10x_gpio.h>
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "IMapService.h"
#include "IAnalogService.h"
#include "MapServiceLinear.h"

#define MAP_READ_TASK_PRIORITY 3

namespace EngineManagement
{	
	MapServiceLinear::MapServiceLinear(HardwareAbstraction::ITimerService *timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config)
	{
		_timerService = timerService;
		_analogService = analogService;
		
		_adcPin = adcPin;
		_analogService->InitPin(_adcPin);
		
		LoadConfig(config);
	}
	
	void MapServiceLinear::LoadConfig(void *config)
	{
		//void *config = EmbeddedResources::MapLinearConfigFile_dat.data();
		MaxMapKpa = ((float *)config)[0];
		float minMapKpa = ((float *)config)[1];
		uint16_t maxVolt12Bit = ((uint16_t *)config)[4];
		uint16_t minVolt12Bit = ((uint16_t *)config)[5];
		_slope = (MaxMapKpa - minMapKpa) / (maxVolt12Bit - minVolt12Bit);
		_offset = minMapKpa / _slope - minVolt12Bit;
	}
	
	void MapServiceLinear::ReadMap()
	{
		float prevMapKpa = MapKpa;
		MapKpa = _slope * _analogService->ReadPin(_adcPin) + _offset;
		unsigned int readTick = _timerService->GetTick();
		//if ther hasn't been a full tick between reads then return;
		if (_lastReadTick == readTick)
			return;
		MapKpaDerivative = ((MapKpa - prevMapKpa) / (_lastReadTick - readTick)) * _timerService->GetTicksPerSecond();
		_lastReadTick = readTick;
	}
}