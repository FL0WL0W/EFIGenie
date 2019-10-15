#include "Variables/Variable_Operation.h"
#include "Operations/Operation_DutyCyclePinRead.h"

#ifdef OPERATION_DUTYCYCLEPINREAD_H
namespace Operations
{
	Operation_DutyCyclePinRead::Operation_DutyCyclePinRead( HardwareAbstraction::IPwmService *pwmService, const uint16_t pin, const uint16_t minFrequency)
	{
		_pwmService = pwmService;
		_pin = pin;
		_minFrequency = minFrequency;

		_pwmService->InitPin(_pin, In, _minFrequency);
	}

	ScalarVariable Operation_DutyCyclePinRead::Execute()
	{
		const PwmValue value = _pwmService->ReadPin(_pin);
		return ScalarVariable(value.PulseWidth / value.Period);
	}

	IOperationBase *Operation_DutyCyclePinRead::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		const uint16_t pin = IService::CastAndOffset<uint16_t>(config, sizeOut);
		const uint16_t minFrequency = IService::CastAndOffset<uint16_t>(config, sizeOut);
		return new Operation_DutyCyclePinRead(serviceLocator->LocateAndCast<HardwareAbstraction::IPwmService>(PWM_SERVICE_ID), pin, minFrequency);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_DutyCyclePinRead, 8, ScalarVariable)
}
#endif