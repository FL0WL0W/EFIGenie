#include <stm32f10x_gpio.h>
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "IMapService.h"
#include "IDigitalService.h"
#include "IInjectorService.h"
#include "InjectorService.h"

namespace EngineManagement
{
	InjectorService::InjectorService(HardwareAbstraction::IDigitalService *digitalService, uint8_t injectorPin, bool normalOn, bool highZ)
	{
		_digitalService = digitalService;
		_injectorPin = injectorPin;
		_normalOn = normalOn;
		_highZ = highZ;
		
		_digitalService->InitPin(_injectorPin, HardwareAbstraction::PinDirection::Out);
		_digitalService->WritePin(_injectorPin, _normalOn);
	}
	
	void InjectorService::InjectorOpen()
	{
		if (_highZ && !_normalOn)
		{
			_digitalService->InitPin(_injectorPin, HardwareAbstraction::PinDirection::In);
		}
		else
		{
			_digitalService->WritePin(_injectorPin, !_normalOn);
		}
	}
	
	void InjectorService::InjectorClose()
	{
		if (_highZ && _normalOn)
		{
			_digitalService->InitPin(_injectorPin, HardwareAbstraction::PinDirection::In);
		}
		else
		{
			_digitalService->WritePin(_injectorPin, _normalOn);
		}
	}
}