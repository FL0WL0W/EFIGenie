#include "Operations/IOperation.h"
#include "Operations/Operation_EnginePosition.h"

#ifndef OPERATION_ENGINEISSEQUENTIAL_H
#define OPERATION_ENGINEISSEQUENTIAL_H
namespace OperationArchitecture
{
	class Operation_EngineIsSequential : public IOperation<bool, EnginePosition>
	{
	protected:
		static Operation_EngineIsSequential *_instance;
	public:		
		bool Execute(EnginePosition enginePosition) override;

		static IOperationBase *Create(const void *config, unsigned int &sizeOut);
		static Operation_EngineIsSequential *Construct();
	};
}
#endif