#include "Operations/Operation.h"
#include "ReluctorResult.h"

#ifndef OPERATION_ENGINEPOSITION_H
#define OPERATION_ENGINEPOSITION_H
namespace EFIGenie
{
	struct EnginePosition : public ReluctorOperations::ReluctorResult
	{
		bool Sequential : 1;

		EnginePosition() : Sequential(false) {}
	};

	class Operation_EnginePosition : public OperationArchitecture::Operation<EnginePosition, ReluctorOperations::ReluctorResult, ReluctorOperations::ReluctorResult>
	{
	protected:
		EnginePosition _previousPreviousReluctorResult;
		EnginePosition _previousReluctorResult;
		bool _crankPriority;
	public:		
        Operation_EnginePosition(bool crankPriority);

		EnginePosition Execute(ReluctorOperations::ReluctorResult crankPosition, ReluctorOperations::ReluctorResult camPosition) override;
	};
}
#endif