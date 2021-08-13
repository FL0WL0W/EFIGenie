#include "Operations/IOperation.h"
#include "EmbeddedIOServiceCollection.h"
#include "Operations/OperationPackager.h"

#ifndef OPERATION_ENGINEINJECTORPRIME_H
#define OPERATION_ENGINEINJECTORPRIME_H
namespace OperationArchitecture
{
	class Operation_EngineInjectorPrime : public IOperation<void, float>
	{
	protected:
		EmbeddedIOServices::ITimerService *_timerService;
		std::function<void()> _openCallBack;
		EmbeddedIOServices::Task *_closeTask;
	public:		
        Operation_EngineInjectorPrime(EmbeddedIOServices::ITimerService *timerService, std::function<void()> openCallBack, std::function<void()> closeCallBack);
		~Operation_EngineInjectorPrime();

		void Execute(float time) override;

		static IOperationBase *Create(const void *config, size_t &sizeOut, const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager);
	};
}
#endif