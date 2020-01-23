#include "Operations/Operation_TicksToSeconds.h"

#ifdef OPERATION_TICKSTOSECONDS_H
namespace Operations
{
	Operation_TicksToSeconds *Operation_TicksToSeconds::_instance = 0;
	Operation_TicksToSeconds::Operation_TicksToSeconds(HardwareAbstraction::ITimerService *timerService)
	{
		_timerService = timerService;
	}

	ScalarVariable Operation_TicksToSeconds::Execute(ScalarVariable ticks)
	{
		return ScalarVariable(ticks.To<float>() / _timerService->GetTicksPerSecond());
	}

	IOperationBase * Operation_TicksToSeconds::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		if(_instance == 0)
			_instance = new Operation_TicksToSeconds(serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID));
		return _instance;
	}
	
	IOPERATION_REGISTERFACTORY_CPP(Operation_TicksToSeconds, 18)
}
#endif