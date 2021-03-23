#include "Operations/IOperation.h"
#include "Operations/Operation_EnginePosition.h"

#ifndef OPERATION_ENGINERPM_H
#define OPERATION_ENGINERPM_H
namespace OperationArchitecture
{
	class Operation_EngineRpm : public IOperation<float, EnginePosition>
	{
	public:		
        Operation_EngineRpm();

		float Execute(EnginePosition enginePosition) override;

		static IOperationBase *Create(const void *config, unsigned int &sizeOut);
	};
}
#endif