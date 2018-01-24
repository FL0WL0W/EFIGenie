#include <stm32f10x_gpio.h>
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "MicroRtos.h"
#include "IMapService.h"
#include "IAnalogService.h"
#include "MapServiceLinear.h"

#define MAP_READ_TASK_PRIORITY 3

namespace EngineManagement
{
	MapServiceLinear::MapServiceLinear(MicroRtos::MicroRtos *microRtos, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config)
	{
		_microRtos = microRtos;
		_analogService = analogService;
		
		_adcPin = adcPin;
		_analogService->InitPin(_adcPin);
		
		_readMapTask = _microRtos->ScheduleTask(std::bind(&MapServiceLinear::ReadMap, this), _microRtos->GetTick() + 10000, MAP_READ_TASK_PRIORITY, false);
		
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
		_sampleRate = ((unsigned int *)config)[3];
	}
	
	void MapServiceLinear::ReadMap()
	{
		MapKpa = _slope * _analogService->ReadPin(_adcPin) + _offset;
		_microRtos->ReScheduleTask(_readMapTask, _microRtos->GetTick() + _sampleRate);
	}
}