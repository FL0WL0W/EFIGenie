#include "Variables/Variable_Operation.h"
#include "Operations/Operation_GetTick.h"

#ifdef OPERATION_GETTICK_H
namespace Operations
{
	Operation_GetTick *Operation_GetTick::_instance = 0;
	Operation_GetTick::Operation_GetTick(HardwareAbstraction::ITimerService *timerService)
	{
		_timerService = timerService;
	}

	ScalarVariable Operation_GetTick::Execute()
	{
		return ScalarVariable::FromTick(_timerService->GetTick());
	}

	IOperationBase * Operation_GetTick::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		if(_instance == 0)
			_instance = new Operation_GetTick(serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID));
		return _instance;
	}
	
	IOPERATION_REGISTERFACTORY_CPP(Operation_GetTick, 16, ScalarVariable)
}
#endif