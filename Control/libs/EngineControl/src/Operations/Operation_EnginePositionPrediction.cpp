#include "Operations/Operation_EnginePositionPrediction.h"
#include "Variables/Variable_Operation.h"

#ifdef OPERATION_ENGINEPOSITIONPREDICTION_H
namespace Operations
{
	Operation_EnginePositionPrediction::Operation_EnginePositionPrediction(HardwareAbstraction::ITimerService *timerService)
	{
		_timerService = timerService;
	}

	ScalarVariable Operation_EnginePositionPrediction::Execute(ScalarVariable desiredPositionIn, EnginePosition enginePosition)
	{
		float desiredPosition = desiredPositionIn.To<float>();
		float delta = 0;
		if(enginePosition.Sequential)
		{
			while(desiredPosition < 0)
			{
				desiredPosition += 720;
			}
			while(desiredPosition > 720)
			{
				desiredPosition -= 720;
			}
			delta = desiredPosition - enginePosition.Position;
			while(delta < 0)
			{
				delta += 720;
			}
		}
		else
		{
			while(desiredPosition < 0)
			{
				desiredPosition += 360;
			}
			while(desiredPosition > 360)
			{
				desiredPosition -= 360;
			}
			delta = desiredPosition - enginePosition.Position;
			while(delta < 0)
			{
				delta += 360;
			}
		}

		float ticksPerDegree = enginePosition.PositionDot / _timerService->GetTicksPerSecond();

		return ScalarVariable::FromTick(static_cast<uint32_t>(ticksPerDegree * delta) + enginePosition.CalculatedTick);
	}

	Operations::IOperationBase *Operation_EnginePositionPrediction::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		return new Operation_EnginePositionPrediction(serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID));
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_EnginePositionPrediction, 2002, ScalarVariable, ScalarVariable, EnginePosition)
}
#endif