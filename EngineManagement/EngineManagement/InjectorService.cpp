#ifndef NOINJECTION
#include "Services.h"
#include "InjectorService.h"

namespace EngineManagement
{
	InjectorService::InjectorService(unsigned char injectorPin, bool normalOn, bool highZ)
	{
		_injectorPin = injectorPin;
		_normalOn = normalOn;
		_highZ = highZ;

		if (_highZ && _normalOn)
		{
			CurrentDigitalService->InitPin(_injectorPin, HardwareAbstraction::In);
		}
		else
		{
			CurrentDigitalService->InitPin(_injectorPin, HardwareAbstraction::Out);
			
			CurrentDigitalService->WritePin(_injectorPin, _normalOn);
		}
	}
	
	void InjectorService::InjectorOpen()
	{
		if (_highZ && !_normalOn)
		{
			CurrentDigitalService->InitPin(_injectorPin, HardwareAbstraction::In);
		}
		else
		{
			if (_highZ)
			{
				CurrentDigitalService->InitPin(_injectorPin, HardwareAbstraction::Out);
			}
			
			CurrentDigitalService->WritePin(_injectorPin, !_normalOn);
		}
	}
	
	void InjectorService::InjectorClose()
	{
		if (_highZ && _normalOn)
		{
			CurrentDigitalService->InitPin(_injectorPin, HardwareAbstraction::In);
		}
		else
		{
			if (_highZ)
			{
				CurrentDigitalService->InitPin(_injectorPin, HardwareAbstraction::Out);
			}
			
			CurrentDigitalService->WritePin(_injectorPin, _normalOn);
		}
	}
}
#endif