#include "Operations/Operation_ScheduleCallBack.h"

#ifdef OPERATION_SCHEDULECALLBACK_H
namespace Operations
{
	Operation_ScheduleCallBack::Operation_ScheduleCallBack(HardwareAbstraction::ITimerService *timerService, HardwareAbstraction::ICallBack *callBack)
	{
		_timerService = timerService;
		_task = new HardwareAbstraction::Task(callBack, false);
	}

	void Operation_ScheduleCallBack::Execute(ScalarVariable tick)
	{
		_timerService->ScheduleTask(_task, tick.To<uint32_t>());
	}

	IOperationBase *Operation_ScheduleCallBack::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
        HardwareAbstraction::ICallBack * const callBack = reinterpret_cast<HardwareAbstraction::ICallBack *>(IOperationBase::CreateExecute(serviceLocator, config, sizeOut));
		return new Operation_ScheduleCallBack(serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID), callBack);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_ScheduleCallBack, 15)
}
#endif