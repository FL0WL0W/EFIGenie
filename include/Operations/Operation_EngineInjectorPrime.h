#include "Operations/IOperation.h"
#include "EmbeddedIOServiceCollection.h"
#include "ICallBack.h"

#ifndef OPERATION_ENGINEINJECTORPRIME_H
#define OPERATION_ENGINEINJECTORPRIME_H
namespace OperationArchitecture
{
	class Operation_EngineInjectorPrime : public IOperation<void, float>
	{
	protected:
		EmbeddedIOServices::ITimerService *_timerService;
		EmbeddedIOServices::ICallBack *_openCallBack;
		EmbeddedIOServices::Task *_closeTask;
	public:		
        Operation_EngineInjectorPrime(EmbeddedIOServices::ITimerService *timerService, EmbeddedIOServices::ICallBack *openCallBack, EmbeddedIOServices::ICallBack *closeCallBack);

		void Execute(float time) override;

		static IOperationBase *Create(const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif