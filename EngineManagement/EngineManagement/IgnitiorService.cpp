#ifndef NOIGNITION
#include "Services.h"
#include "IgnitorService.h"

namespace EngineManagement
{
	IgnitorService::IgnitorService(unsigned char ignitionPin, bool normalOn, bool highZ)
	{
		_ignitionPin = ignitionPin;
		_normalOn = normalOn;
		_highZ = highZ;
		

		if (_highZ && _normalOn)
		{
			CurrentDigitalService->InitPin(_ignitionPin, HardwareAbstraction::In);
		}
		else
		{
			CurrentDigitalService->InitPin(_ignitionPin, HardwareAbstraction::Out);

			CurrentDigitalService->WritePin(_ignitionPin, _normalOn);
		}
	}
	
	void IgnitorService::CoilDwell()
	{
		if (_highZ && !_normalOn)
		{
			CurrentDigitalService->InitPin(_ignitionPin, HardwareAbstraction::In);
		}
		else
		{
			if (_highZ)
			{
				CurrentDigitalService->InitPin(_ignitionPin, HardwareAbstraction::Out);
			}
			
			CurrentDigitalService->WritePin(_ignitionPin, !_normalOn);
		}
	}
	
	void IgnitorService::CoilFire()
	{
		if (_highZ && _normalOn)
		{
			CurrentDigitalService->InitPin(_ignitionPin, HardwareAbstraction::In);
		}
		else
		{
			if (_highZ)
			{
				CurrentDigitalService->InitPin(_ignitionPin, HardwareAbstraction::Out);
			}
			
			CurrentDigitalService->WritePin(_ignitionPin, _normalOn);
		}
	}
}
#endif