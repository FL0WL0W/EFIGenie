#include "Operations/Operation_DigitalPinRead.h"

#ifdef OPERATION_DIGITALPINREAD_H
namespace Operations
{
	Operation_DigitalPinRead::Operation_DigitalPinRead(HardwareAbstraction::IDigitalService *digitalService, const uint16_t pin, const bool inverted)
	{
		_digitalService = digitalService;
		_pin = pin;
		_inverted = inverted;

		_digitalService->InitPin(_pin, In);
	}

	ScalarVariable Operation_DigitalPinRead::Execute()
	{
		if (_inverted)
			return ScalarVariable(!_digitalService->ReadPin(_pin));
		return ScalarVariable(_digitalService->ReadPin(_pin));
	}

	IOperationBase *Operation_DigitalPinRead::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		const uint16_t pin = IService::CastAndOffset<uint16_t>(config, sizeOut);
		const bool inverted = IService::CastAndOffset<bool>(config, sizeOut);
		return new Operation_DigitalPinRead(serviceLocator->LocateAndCast<HardwareAbstraction::IDigitalService>(DIGITAL_SERVICE_ID), pin, inverted);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_DigitalPinRead, 4)
}
#endif