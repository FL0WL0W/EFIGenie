#include "Operations/Operation_EngineInjectorPrime.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINEINJECTORPRIME_H
namespace OperationArchitecture
{
	Operation_EngineInjectorPrime::Operation_EngineInjectorPrime(ITimerService *timerService, ICallBack *openCallBack, ICallBack *closeCallBack)
	{
		_timerService = timerService;
		_openCallBack = openCallBack;
		_closeTask = new Task(closeCallBack, false);
	}

	void Operation_EngineInjectorPrime::Execute(float time)
	{
		_openCallBack->Execute();
		_timerService->ScheduleTask(_closeTask, _timerService->GetTick() + time * _timerService->GetTicksPerSecond());
	}

	IOperationBase *Operation_EngineInjectorPrime::Create(const void *config, size_t &sizeOut, const EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager)
	{
		ICallBack * openCallBack = 0;
		ICallBack * closeCallBack = 0;

		size_t size = 0;
		IOperationBase *operation = packager->Package(config, size);
		Config::OffsetConfig(config, sizeOut, size);
		if(operation->NumberOfParameters == 1)
		{
			openCallBack = new CallBackWithParameters<IOperationBase, bool>(operation, &IOperationBase::Execute<bool>, 1);
			closeCallBack = new CallBackWithParameters<IOperationBase, bool>(operation, &IOperationBase::Execute<bool>, false);
		}
		else
		{
			openCallBack = new CallBack<IOperationBase>(operation, &IOperationBase::Execute);

			size = 0;
			IOperationBase *operation = packager->Package(config, size);
			Config::OffsetConfig(config, sizeOut, size);
			closeCallBack = new CallBack<IOperationBase>(operation, &IOperationBase::Execute);
		}
		
		return new Operation_EngineInjectorPrime(embeddedIOServiceCollection->TimerService, openCallBack, closeCallBack);
	}
}
#endif