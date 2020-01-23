#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Service/ServiceLocator.h"
#include "Packed.h"
#include "Interpolation.h"
#include "ScalarVariable.h"
#include "HardwareAbstraction/ITimerService.h"

/*
To create this operator
uint16									6001(BUILDER_OPERATION)
uint16									xx(InstanceID of Operation)
uint16									18(FactoryID)

To use this operator on a variable in the main loop
uint16									7001(BUILDER_VARIABLE)
uint16									17(FactoryID)
uint16									xx(InstanceID of Variable Result)
uint16									xx(InstanceID of Operation)
uint16									xx(InstanceID of Variable X)
*/

#ifndef OPERATION_TICKSTOSECONDS_H
#define OPERATION_TICKSTOSECONDS_H
namespace Operations
{
	class Operation_TicksToSeconds : public IOperation<ScalarVariable, ScalarVariable>
	{
	protected:
		static Operation_TicksToSeconds *_instance;
		HardwareAbstraction::ITimerService *_timerService;
	public:		
        Operation_TicksToSeconds(HardwareAbstraction::ITimerService *timerService);

		ScalarVariable Execute(ScalarVariable seconds) override;

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif