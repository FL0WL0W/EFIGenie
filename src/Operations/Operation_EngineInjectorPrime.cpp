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

	IOperationBase *Operation_EngineInjectorPrime::Create(const EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
	{
		const uint32_t openOperationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
		const uint32_t closeOperationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
		// ICallBack * const openCallBack = new CallBack<IOperationBase>(, &IOperationBase::Execute);
		// ICallBack * const closeCallBack = new CallBack<IOperationBase>(, &IOperationBase::Execute);
		ICallBack * const openCallBack = 0;
		ICallBack * const closeCallBack = 0;
		
		return new Operation_EngineInjectorPrime(embeddedIOServiceCollection->TimerService, openCallBack, closeCallBack);
	}
}
#endif