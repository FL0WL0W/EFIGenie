#include "Operations/Operation_PulseWidthPinRead.h"

#ifdef OPERATION_PULSEWIDTHPINREAD_H
namespace Operations
{
	Operation_PulseWidthPinRead::Operation_PulseWidthPinRead( HardwareAbstraction::IPwmService *pwmService, const uint16_t pin, const uint16_t minFrequency)
	{
		_pwmService = pwmService;
		_pin = pin;
		_minFrequency = minFrequency;

		_pwmService->InitPin(_pin, In, _minFrequency);
	}

	ScalarVariable Operation_PulseWidthPinRead::Execute()
	{
		return ScalarVariable(_pwmService->ReadPin(_pin).PulseWidth);
	}

	IOperationBase *Operation_PulseWidthPinRead::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		const uint16_t pin = IService::CastAndOffset<uint16_t>(config, sizeOut);
		const uint16_t minFrequency = IService::CastAndOffset<uint16_t>(config, sizeOut);
		return new Operation_PulseWidthPinRead(serviceLocator->LocateAndCast<HardwareAbstraction::IPwmService>(PWM_SERVICE_ID), pin, minFrequency);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_PulseWidthPinRead, 7)
}
#endif