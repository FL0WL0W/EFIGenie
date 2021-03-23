#include "Operations/IOperation.h"
#include "Operations/Operation_EnginePosition.h"
#include "EmbeddedIOServiceCollection.h"

#ifndef OPERATION_ENGINEPOSITIONTICKSTODEGREES_H
#define OPERATION_ENGINEPOSITIONTICKSTODEGREES_H
namespace OperationArchitecture
{
	class Operation_EnginePositionTicksToDegrees : public IOperation<float, uint32_t, EnginePosition>
	{
	protected:
		static Operation_EnginePositionTicksToDegrees *_instance;
	public:		
		float Execute(uint32_t ticks, EnginePosition enginePosition) override;

		static IOperationBase *Create(const void *config, unsigned int &sizeOut);
	};
}
#endif