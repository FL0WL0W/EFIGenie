#include "Operations/Operation_AnalogPinRead.h"

#ifdef OPERATION_ANALOGPINREAD_H
namespace Operations
{
	Operation_AnalogPinRead::Operation_AnalogPinRead( HardwareAbstraction::IAnalogService *analogService, const uint16_t pin)
	{
		_analogService = analogService;
		_pin = pin;

		_analogService->InitPin(_pin);
	}

	ScalarVariable Operation_AnalogPinRead::Execute()
	{
		return ScalarVariable(_analogService->ReadPin(_pin));
	}

	IOperationBase *Operation_AnalogPinRead::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		return new Operation_AnalogPinRead(serviceLocator->LocateAndCast<HardwareAbstraction::IAnalogService>(ANALOG_SERVICE_ID), IService::CastAndOffset<uint16_t>(config, sizeOut));
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_AnalogPinRead, 5)
}
#endif