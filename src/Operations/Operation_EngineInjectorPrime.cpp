#include "Operations/Operation_EngineInjectorPrime.h"
#include "Config.h"

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;
using namespace EmbeddedIOOperations;

#ifdef OPERATION_ENGINEINJECTORPRIME_H
namespace EFIGenie
{
	Operation_EngineInjectorPrime::Operation_EngineInjectorPrime(ITimerService *timerService, callback_t openCallBack, callback_t closeCallBack) :
		_timerService(timerService),
		_openCallBack(openCallBack),
		_closeTask(new Task(closeCallBack))
	{ }

	Operation_EngineInjectorPrime::~Operation_EngineInjectorPrime()
	{
		_timerService->UnScheduleTask(_closeTask);
		delete _closeTask;
	}

	void Operation_EngineInjectorPrime::Execute(float time)
	{
		_openCallBack();
		_timerService->ScheduleTask(_closeTask, _timerService->GetTick() + static_cast<tick_t>(time * _timerService->GetTicksPerSecond()));
	}

	AbstractOperation *Operation_EngineInjectorPrime::Create(const void *config, size_t &sizeOut, const ServiceRegistry *serviceRegistry, OperationFactory *factory)
	{
		callback_t openCallBack = 0;
		callback_t closeCallBack = 0;

		size_t size = 0;
		AbstractOperation *operation = factory->Create(config, size);
		Config::OffsetConfig(config, sizeOut, size);
		openCallBack = [operation]() { operation->Execute(true); };
		closeCallBack = [operation]() { operation->Execute(false); };
		
		return new Operation_EngineInjectorPrime(serviceRegistry->TryGet<EmbeddedIOServices::ITimerService>(), openCallBack, closeCallBack);
	}
}
#endif