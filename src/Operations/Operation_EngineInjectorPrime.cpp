#include "Operations/Operation_EngineInjectorPrime.h"
#include "Config.h"

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;
using namespace EmbeddedIOOperations;

#ifdef OPERATION_ENGINEINJECTORPRIME_H
namespace EFIGenie
{
	Operation_EngineInjectorPrime::Operation_EngineInjectorPrime(ITimerService * const timerService, AbstractOperation * const operation) :
		_timerService(timerService),
		_operation(operation),
		_closeTask(new Task([operation]() { operation->Execute(false); }))
	{ }

	Operation_EngineInjectorPrime::~Operation_EngineInjectorPrime()
	{
		_timerService->UnScheduleTask(_closeTask);
		delete _closeTask;
		delete _operation;
	}

	void Operation_EngineInjectorPrime::Execute(float time)
	{
		_operation->Execute(true);
		_timerService->ScheduleTask(_closeTask, _timerService->GetTick() + static_cast<tick_t>(time * _timerService->GetTicksPerSecond()));
	}

	AbstractOperation *Operation_EngineInjectorPrime::Create(const void *config, size_t &sizeOut, const ServiceRegistry *serviceRegistry, OperationFactory *factory)
	{
		size_t size = 0;
		//we own this operation now. Operation_EngineInjectorPrime must delete it
		AbstractOperation *operation = factory->Create(config, size);
		Config::OffsetConfig(config, sizeOut, size);
		
		return new Operation_EngineInjectorPrime(serviceRegistry->TryGet<EmbeddedIOServices::ITimerService>(), operation);
	}
}
#endif