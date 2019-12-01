#include "Operations/Operation_EnginePositionTicksToDegrees.h"
#include "Variables/Variable_Operation.h"

#ifdef OPERATION_ENGINEPOSITIONTICKSTODEGREES_H
namespace Operations
{
	Operation_EnginePositionTicksToDegrees *Operation_EnginePositionTicksToDegrees::_instance = 0;
	Operation_EnginePositionTicksToDegrees::Operation_EnginePositionTicksToDegrees(HardwareAbstraction::ITimerService *timerService)
	{
		_timerService = timerService;
	}

	ScalarVariable Operation_EnginePositionTicksToDegrees::Execute(ScalarVariable ticks, EnginePosition enginePosition)
	{
		return ticks * enginePosition.PositionDot / _timerService->GetTicksPerSecond();
	}

	Operations::IOperationBase *Operation_EnginePositionTicksToDegrees::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		if(_instance == 0)
			_instance = new Operation_EnginePositionTicksToDegrees(serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID));
		return _instance;
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_EnginePositionTicksToDegrees, 2003, ScalarVariable, ScalarVariable, EnginePosition)
}
#endif