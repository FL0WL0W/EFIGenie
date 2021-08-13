#include "Operations/IOperation.h"
#include "ReluctorResult.h"

#ifndef OPERATION_ENGINEPOSITION_H
#define OPERATION_ENGINEPOSITION_H
namespace OperationArchitecture
{
	struct EnginePosition : public ReluctorResult
	{
		bool Sequential : 1;
	};

	class Operation_EnginePosition : public IOperation<EnginePosition, ReluctorResult, ReluctorResult>
	{
	protected:
		EnginePosition _previousPreviousReluctorResult;
		EnginePosition _previousReluctorResult;
		bool _crankPriority;
	public:		
        Operation_EnginePosition(bool crankPriority);

		EnginePosition Execute(ReluctorResult crankPosition, ReluctorResult camPosition) override;

		static Operation_EnginePosition InstanceCrankPriority;
		static Operation_EnginePosition InstanceCamPriority;
	};
}
#endif