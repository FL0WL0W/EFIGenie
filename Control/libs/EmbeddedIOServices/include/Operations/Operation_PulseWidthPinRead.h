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
uint16									7(FactoryID)
uint16 									pin
uint16 									minFrequency

To use this operator on a variable in the main loop
uint16									7001(BUILDER_VARIABLE)
uint16									7(FactoryID)
uint16									xx(InstanceID of Variable)
uint16									xx(InstanceID of Operation)

To create a CallBack to use this operator on a variable
uint16									7002(BUILDER_VARIABLE_TRANSLATE_CALL_BACK)
uint16									xx(InstanceID of CallBack)
uint16									7(FactoryID)
uint16									xx(InstanceID of Variable)
uint16									xx(InstanceID of Operation)
*/

#ifndef OPERATION_PULSEWIDTHPINREAD_H
#define OPERATION_PULSEWIDTHPINREAD_H
namespace Operations
{
	class Operation_PulseWidthPinRead : public IOperation<ScalarVariable>
	{
	protected:
		HardwareAbstraction::IPwmService *_pwmService;
		uint16_t _pin;
		uint16_t _minFrequency;
	public:		
        Operation_PulseWidthPinRead(HardwareAbstraction::IPwmService *pwmService, const uint16_t pin, const uint16_t minFrequency);

		ScalarVariable Execute() override;

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif