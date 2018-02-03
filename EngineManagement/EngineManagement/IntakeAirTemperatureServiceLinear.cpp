#include <stm32f10x_gpio.h>
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "IIntakeAirTemperatureService.h"
#include "IAnalogService.h"
#include "IntakeAirTemperatureServiceLinear.h"

#define MAP_READ_TASK_PRIORITY 3

namespace EngineManagement
{	
	IntakeAirTemperatureServiceLinear::IntakeAirTemperatureServiceLinear(HardwareAbstraction::ITimerService *timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config)
	{
		_timerService = timerService;
		_analogService = analogService;
		
		_adcPin = adcPin;
		_analogService->InitPin(_adcPin);
		
		LoadConfig(config);
	}
	
	void IntakeAirTemperatureServiceLinear::LoadConfig(void *config)
	{
		MaxIntakeAirTemperature = *((float *)config);
		config = (void*)((float *)config + 1);
		
		float minIat = *((float *)config);
		config = (void*)((float *)config + 1);
		
		unsigned short maxVolt16Bit = *((unsigned short *)config);
		config = (void*)((unsigned short *)config + 1);
		
		unsigned short minVolt16Bit = *((unsigned short *)config);
		config = (void*)((unsigned short *)config + 1);
		
		_slope = (MaxIntakeAirTemperature - minIat) / (maxVolt16Bit - minVolt16Bit);
		_offset = minIat / _slope - minVolt16Bit;
	}
	
	void IntakeAirTemperatureServiceLinear::ReadIat()
	{
		float prevEct = IntakeAirTemperature;
		IntakeAirTemperature = _slope * _analogService->ReadPin(_adcPin) + _offset;
		unsigned int readTick = _timerService->GetTick();
		//if ther hasn't been a full tick between reads then return;
		if(_lastReadTick == readTick)
			return;
		IntakeAirTemperatureDerivative = ((IntakeAirTemperature - prevEct) / (_lastReadTick - readTick)) * _timerService->GetTicksPerSecond();
		_lastReadTick = readTick;
	}
}