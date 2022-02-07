#include "Operations/IOperation.h"
#include "EmbeddedIOServiceCollection.h"
#include "Operations/OperationPackager.h"

#ifndef OPERATION_ENGINEINJECTORPRIME_H
#define OPERATION_ENGINEINJECTORPRIME_H
namespace EFIGenie
{
	class Operation_EngineInjectorPrime : public OperationArchitecture::IOperation<void, float>
	{
	protected:
		EmbeddedIOServices::ITimerService *_timerService;
		const EmbeddedIOServices::callback_t _openCallBack;
		EmbeddedIOServices::Task *_closeTask;
	public:		
        Operation_EngineInjectorPrime(EmbeddedIOServices::ITimerService *timerService, const EmbeddedIOServices::callback_t openCallBack, const EmbeddedIOServices::callback_t closeCallBack);
		~Operation_EngineInjectorPrime();

		void Execute(float time) override;

		static OperationArchitecture::IOperationBase *Create(const void *config, size_t &sizeOut, const EmbeddedIOOperations::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationArchitecture::OperationPackager *packager);
	};
}
#endif