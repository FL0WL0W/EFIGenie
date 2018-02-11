#include <stm32f10x_gpio.h>
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "IVoltageService.h"
#include "IAnalogService.h"
#include "VoltageService_Analog.h"

namespace EngineManagement
{	
	VoltageService_Analog::VoltageService_Analog(HardwareAbstraction::ITimerService *timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config)
	{
		_timerService = timerService;
		_analogService = analogService;
		
		_adcPin = adcPin;
		_analogService->InitPin(_adcPin);
		
		LoadConfig(config);
	}
	
	void VoltageService_Analog::LoadConfig(void *config)
	{
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
	
	void VoltageService_Analog::ReadVoltage()
	{
		float prevVoltage = Voltage;
		float adcValue = _analogService->ReadPin(_adcPin);
		Voltage = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
		unsigned int readTickOrig = _timerService->GetTick();
		//if ther hasn't been a full tick between reads then return;
		if(_lastReadTick == readTickOrig)
			return;
		unsigned int readTick = readTickOrig;
		if (readTick < _lastReadTick)
		{
			_lastReadTick = _lastReadTick + 2147483647;
			readTick += 2147483647;
		}
		if (readTick < (_lastReadTick + _timerService->GetTicksPerSecond() / _dotSampleRate))
			return;
		VoltageDot = ((Voltage - prevVoltage) / (_lastReadTick - readTick)) * _timerService->GetTicksPerSecond();
		_lastReadTick = readTick;
	}
}