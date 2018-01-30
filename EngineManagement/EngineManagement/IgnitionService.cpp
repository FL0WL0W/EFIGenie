#include <stm32f10x_gpio.h>
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "IMapService.h"
#include "IDigitalService.h"
#include "IIgnitionService.h"
#include "IgnitionService.h"

namespace EngineManagement
{
	IgnitionService::IgnitionService(HardwareAbstraction::IDigitalService *digitalService, uint8_t ignitionPin, bool normalOn, bool highZ)
	{
		_digitalService = digitalService;
		_ignitionPin = ignitionPin;
		_normalOn = normalOn;
		_highZ = highZ;
		
		_digitalService->InitPin(_ignitionPin, HardwareAbstraction::PinDirection::Out);
		_digitalService->WritePin(_ignitionPin, _normalOn);
	}
	
	void IgnitionService::CoilDwell()
	{
		if (_highZ && !_normalOn)
		{
			_digitalService->InitPin(_ignitionPin, HardwareAbstraction::PinDirection::In);
		}
		else
		{
			_digitalService->WritePin(_ignitionPin, !_normalOn);
		}
	}
	
	void IgnitionService::CoilFire()
	{
		if (_highZ && _normalOn)
		{
			_digitalService->InitPin(_ignitionPin, HardwareAbstraction::PinDirection::In);
		}
		else
		{
			_digitalService->WritePin(_ignitionPin, _normalOn);
		}
	}
}