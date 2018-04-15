#include "BooleanInputService.h"

#ifdef BOOLEANINPUTSERVICE_H
namespace IOServiceLayer
{
	BooleanInputService::BooleanInputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, BooleanInputServiceConfig *config)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_config = config;
		
		_hardwareAbstractionCollection->DigitalService->InitPin(_config->Pin, HardwareAbstraction::In);
	}
	
	void BooleanInputService::ReadValue()
	{
		Value = _hardwareAbstractionCollection->DigitalService->ReadPin(_config->Pin);
		if (_config->Inverted)
			Value = !Value;
	}
}
#endif