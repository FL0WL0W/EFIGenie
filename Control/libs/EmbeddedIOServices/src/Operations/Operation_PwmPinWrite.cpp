#include "Operations/Operation_PwmPinWrite.h"

#ifdef OPERATION_PWMPINWRITE_H
namespace Operations
{
	Operation_PwmPinWrite::Operation_PwmPinWrite( HardwareAbstraction::IPwmService *pwmService, const uint16_t pin, const uint16_t minFrequency)
	{
		_pwmService = pwmService;
		_pin = pin;
		_minFrequency = minFrequency;

		_pwmService->InitPin(_pin, Out, _minFrequency);
	}

	void Operation_PwmPinWrite::Execute(ScalarVariable period, ScalarVariable pulseWidth)
	{
		_pwmService->WritePin(_pin, { period.To<float>(), pulseWidth.To<float>() });
	}

	IOperationBase *Operation_PwmPinWrite::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		const uint16_t pin = IService::CastAndOffset<uint16_t>(config, sizeOut);
		const uint16_t minFrequency = IService::CastAndOffset<uint16_t>(config, sizeOut);
		return new Operation_PwmPinWrite(serviceLocator->LocateAndCast<HardwareAbstraction::IPwmService>(PWM_SERVICE_ID), pin, minFrequency);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_PwmPinWrite, 11)
}
#endif