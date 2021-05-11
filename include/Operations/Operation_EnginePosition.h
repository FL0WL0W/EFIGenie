#include "Operations/IOperation.h"
#include "Packed.h"
#include "ReluctorResult.h"

#ifndef OPERATION_ENGINEPOSITION_H
#define OPERATION_ENGINEPOSITION_H
namespace OperationArchitecture
{
	PACK(struct EnginePosition : public ReluctorResult
	{
		bool Sequential : 1;
	});

	class Operation_EnginePosition : public IOperation<EnginePosition, ReluctorResult, ReluctorResult>
	{
	protected:
		static Operation_EnginePosition *_instanceTrue;
		static Operation_EnginePosition *_instanceFalse;
		EnginePosition _previousPreviousReluctorResult;
		EnginePosition _previousReluctorResult;
		bool _crankPriority;
	public:		
        Operation_EnginePosition(bool crankPriority);

		EnginePosition Execute(ReluctorResult crankPosition, ReluctorResult camPosition) override;

		static IOperationBase *Create(const void *config, unsigned int &sizeOut);
		static Operation_EnginePosition *Construct(bool crankPriority);
	};
}
#endif