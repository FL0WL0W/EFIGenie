#include "Operations/IOperation.h"
#include "Operations/Operation_EnginePosition.h"
#include "EmbeddedIOServiceCollection.h"

#ifndef OPERATION_ENGINEPOSITIONPREDICTION_H
#define OPERATION_ENGINEPOSITIONPREDICTION_H
namespace OperationArchitecture
{
	class Operation_EnginePositionPrediction : public IOperation<uint32_t, float, EnginePosition>
	{
	protected:
		EmbeddedIOServices::ITimerService *_timerService;
	public:		
		Operation_EnginePositionPrediction(EmbeddedIOServices::ITimerService *timerService);

		uint32_t Execute(float desiredPosition, EnginePosition enginePosition) override;

		static IOperationBase *Create(const void *config, unsigned int &sizeOut, const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection);
	};
}
#endif