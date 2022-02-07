#include "Operations/IOperation.h"
#include "ReluctorResult.h"

#ifndef OPERATION_ENGINEPOSITION_H
#define OPERATION_ENGINEPOSITION_H
namespace EFIGenie
{
	struct EnginePosition : public ReluctorOperations::ReluctorResult
	{
		bool Sequential : 1;
	};

	class Operation_EnginePosition : public OperationArchitecture::IOperation<EnginePosition, ReluctorOperations::ReluctorResult, ReluctorOperations::ReluctorResult>
	{
	protected:
		EnginePosition _previousPreviousReluctorResult;
		EnginePosition _previousReluctorResult;
		bool _crankPriority;
	public:		
        Operation_EnginePosition(bool crankPriority);

		EnginePosition Execute(ReluctorOperations::ReluctorResult crankPosition, ReluctorOperations::ReluctorResult camPosition) override;

		static Operation_EnginePosition InstanceCrankPriority;
		static Operation_EnginePosition InstanceCamPriority;
	};
}
#endif