#include "IOServices/BooleanInputService/BooleanInputService.h"

#ifdef BOOLEANINPUTSERVICE_H
namespace IOServices
{
	BooleanInputService::BooleanInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, BooleanInputServiceConfig *config)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_config = config;
		
		_hardwareAbstractionCollection->DigitalService->InitPin(_config->Pin, In);
	}
	
	void BooleanInputService::ReadValue()
	{
		Value = _hardwareAbstractionCollection->DigitalService->ReadPin(_config->Pin);
		if (_config->Inverted)
			Value = !Value;
	}
}
#endif