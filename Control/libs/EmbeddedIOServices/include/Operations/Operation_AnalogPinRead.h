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
uint16									5(FactoryID)
uint16 									pin

To use this operator on a variable in the main loop
uint16									7001(BUILDER_VARIABLE)
uint16									5(FactoryID)
uint16									xx(InstanceID of Variable)
uint16									xx(InstanceID of Operation)
*/

#ifndef OPERATION_ANALOGPINREAD_H
#define OPERATION_ANALOGPINREAD_H
namespace Operations
{
	class Operation_AnalogPinRead : public IOperation<ScalarVariable>
	{
	protected:
		HardwareAbstraction::IAnalogService *_analogService;
		uint16_t _pin;
	public:		
        Operation_AnalogPinRead( HardwareAbstraction::IAnalogService *analogService, const uint16_t pin);

		ScalarVariable Execute() override;

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif