#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"
#include "Operations/Operation_EnginePosition.h"
#include "ScalarVariable.h"

#ifndef OPERATION_ENGINEPOSITIONTICKSTODEGREES_H
#define OPERATION_ENGINEPOSITIONTICKSTODEGREES_H
namespace Operations
{
	class Operation_EnginePositionTicksToDegrees : public Operations::IOperation<ScalarVariable, ScalarVariable, EnginePosition>
	{
	protected:
		static Operation_EnginePositionTicksToDegrees *_instance;
		HardwareAbstraction::ITimerService *_timerService;
	public:		
        Operation_EnginePositionTicksToDegrees(HardwareAbstraction::ITimerService *timerService);

		ScalarVariable Execute(ScalarVariable ticks, EnginePosition enginePosition) override;

		static Operations::IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif