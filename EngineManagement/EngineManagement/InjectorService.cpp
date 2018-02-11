#include <stdint.h>
#include "ITimerService.h"
#include "IMapService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
#include "IInjectorService.h"
#include "InjectorService.h"

namespace EngineManagement
{
	InjectorService::InjectorService(HardwareAbstraction::IDigitalService *digitalService, unsigned char injectorPin, bool normalOn, bool highZ)
	{
		_digitalService = digitalService;
		_injectorPin = injectorPin;
		_normalOn = normalOn;
		_highZ = highZ;
		
		_digitalService->InitPin(_injectorPin, HardwareAbstraction::Out);
		_digitalService->WritePin(_injectorPin, _normalOn);
	}
	
	void InjectorService::InjectorOpen()
	{
		if (_highZ && !_normalOn)
		{
			_digitalService->InitPin(_injectorPin, HardwareAbstraction::In);
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
			_digitalService->InitPin(_injectorPin, HardwareAbstraction::In);
		}
		else
		{
			_digitalService->WritePin(_injectorPin, _normalOn);
		}
	}
}