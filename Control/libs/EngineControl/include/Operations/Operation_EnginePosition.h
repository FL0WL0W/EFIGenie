#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"
#include "Operations/ReluctorResult.h"

#ifndef OPERATION_ENGINEPOSITION_H
#define OPERATION_ENGINEPOSITION_H
namespace Operations
{
	PACK(struct EnginePosition : public ReluctorResult
	{
		bool Sequential;
	});

	class Operation_EnginePosition : public Operations::IOperation<EnginePosition, ReluctorResult, ReluctorResult>
	{
	protected:
		EnginePosition _previousPreviousReluctorResult;
		EnginePosition _previousReluctorResult;
		bool _crankPriority;
	public:		
        Operation_EnginePosition(bool crankPriority);

		EnginePosition Execute(ReluctorResult crankPosition, ReluctorResult camPosition) override;

		static Operations::IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif