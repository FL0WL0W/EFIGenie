#include "Operations/Operation_EnginePositionPrediction.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINEPOSITIONPREDICTION_H
namespace OperationArchitecture
{
	Operation_EnginePositionPrediction::Operation_EnginePositionPrediction(ITimerService *timerService)
	{
		_timerService = timerService;
	}

	uint32_t Operation_EnginePositionPrediction::Execute(float desiredPosition, EnginePosition enginePosition)
	{
		if(enginePosition.Synced == false)
			return 0;
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
			while(delta < -360)
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
			while(delta < -180)
			{
				delta += 360;
			}
		}

		float ticksPerDegree = _timerService->GetTicksPerSecond() / enginePosition.PositionDot;

		uint32_t positionTick = static_cast<int64_t>(ticksPerDegree * delta) + enginePosition.CalculatedTick;

		return positionTick == 0? 1 : positionTick;
	}

	IOperationBase *Operation_EnginePositionPrediction::Create(const EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
	{
		return new Operation_EnginePositionPrediction(embeddedIOServiceCollection->TimerService);
	}
}
#endif