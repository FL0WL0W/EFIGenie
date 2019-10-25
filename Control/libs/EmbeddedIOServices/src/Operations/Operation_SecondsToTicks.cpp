#include "Variables/Variable_Operation.h"
#include "Operations/Operation_SecondsToTicks.h"

#ifdef OPERATION_SECONDSTOTICKS_H
namespace Operations
{
	Operation_SecondsToTicks *Operation_SecondsToTicks::_instance = 0;
	Operation_SecondsToTicks::Operation_SecondsToTicks(HardwareAbstraction::ITimerService *timerService)
	{
		_timerService = timerService;
	}

	ScalarVariable Operation_SecondsToTicks::Execute(ScalarVariable seconds)
	{
		return ScalarVariable(_timerService->GetTicksPerSecond() * seconds.To<float>());
	}

	IOperationBase * Operation_SecondsToTicks::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		if(_instance == 0)
			_instance = new Operation_SecondsToTicks(serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID));
		return _instance;
	}
	
	IOPERATION_REGISTERFACTORY_CPP(Operation_SecondsToTicks, 17, ScalarVariable, ScalarVariable)
}
#endif