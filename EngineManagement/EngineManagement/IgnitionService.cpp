#include <stdint.h>
#include "ITimerService.h"
#include "IMapService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
#include "IIgnitorService.h"
#include "IgnitorService.h"

namespace EngineManagement
{
	IgnitorService::IgnitorService(HardwareAbstraction::IDigitalService *digitalService, unsigned char ignitionPin, bool normalOn, bool highZ)
	{
		_digitalService = digitalService;
		_ignitionPin = ignitionPin;
		_normalOn = normalOn;
		_highZ = highZ;
		
		_digitalService->InitPin(_ignitionPin, HardwareAbstraction::Out);
		_digitalService->WritePin(_ignitionPin, _normalOn);
	}
	
	void IgnitorService::CoilDwell()
	{
		if (_highZ && !_normalOn)
		{
			_digitalService->InitPin(_ignitionPin, HardwareAbstraction::In);
		}
		else
		{
			_digitalService->WritePin(_ignitionPin, !_normalOn);
		}
	}
	
	void IgnitorService::CoilFire()
	{
		if (_highZ && _normalOn)
		{
			_digitalService->InitPin(_ignitionPin, HardwareAbstraction::In);
		}
		else
		{
			_digitalService->WritePin(_ignitionPin, _normalOn);
		}
	}
}