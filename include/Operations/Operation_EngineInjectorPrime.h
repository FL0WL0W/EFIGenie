#include "Operations/Operation.h"
#include "ServiceRegistry.h"
#include "Operations/OperationFactory.h"
#include "ITimerService.h"

#ifndef OPERATION_ENGINEINJECTORPRIME_H
#define OPERATION_ENGINEINJECTORPRIME_H
namespace EFIGenie
{
	class Operation_EngineInjectorPrime : public OperationArchitecture::Operation<void, float>
	{
	protected:
		EmbeddedIOServices::ITimerService * const _timerService;
		OperationArchitecture::AbstractOperation * const _operation;
		EmbeddedIOServices::Task * const _closeTask;
	public:		
        Operation_EngineInjectorPrime(EmbeddedIOServices::ITimerService * const timerService, OperationArchitecture::AbstractOperation * const _operation);
		~Operation_EngineInjectorPrime();

		void Execute(float time) override;

		static OperationArchitecture::AbstractOperation *Create(const void *config, size_t &sizeOut, const EmbeddedIOOperations::ServiceRegistry *serviceRegistry, OperationArchitecture::OperationFactory *factory);
	};
}
#endif