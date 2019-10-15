#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"
#include "Operations/Operation_EnginePosition.h"
#include "ScalarVariable.h"

#ifndef OPERATION_ENGINEPOSITIONPREDICTION_H
#define OPERATION_ENGINEPOSITIONPREDICTION_H
namespace Operations
{
	class Operation_EnginePositionPrediction : public Operations::IOperation<ScalarVariable, ScalarVariable, EnginePosition>
	{
	protected:
		HardwareAbstraction::ITimerService *_timerService;
	public:		
        Operation_EnginePositionPrediction(HardwareAbstraction::ITimerService *timerService);

		ScalarVariable Execute(ScalarVariable desiredPosition, EnginePosition enginePosition) override;

		static Operations::IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif