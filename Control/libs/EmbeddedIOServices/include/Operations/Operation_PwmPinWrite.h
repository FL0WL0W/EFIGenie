#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"
#include "ScalarVariable.h"

/*
To create this operator
uint16									6001(BUILDER_OPERATION)
uint16									xx(InstanceID of Operation)
uint16									11(FactoryID)
uint16 									pin
uint16 									minFrequency

To use this operator on a variable in the main loop
uint16									7001(BUILDER_VARIABLE)
uint16									11(FactoryID)
uint16									xx(InstanceID of Operation)
uint16									xx(InstanceID of Variable Period)
uint16									xx(InstanceID of Variable PulseWidth)
*/

#ifndef OPERATION_PWMPINWRITE_H
#define OPERATION_PWMPINWRITE_H
namespace Operations
{
	class Operation_PwmPinWrite : public IOperation<void, ScalarVariable, ScalarVariable>
	{
	protected:
		HardwareAbstraction::IPwmService *_pwmService;
		uint16_t _pin;
		uint16_t _minFrequency;
	public:		
        Operation_PwmPinWrite(HardwareAbstraction::IPwmService *pwmService, const uint16_t pin, const uint16_t minFrequency);

		void Execute(ScalarVariable period, ScalarVariable pulseWidth) override;

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif