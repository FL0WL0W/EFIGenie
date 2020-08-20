#include "Operations/Operation_EnginePosition.h"

#ifdef OPERATION_ENGINEPOSITION_H
namespace Operations
{
	Operation_EnginePosition::Operation_EnginePosition(bool crankPriority)
	{
		_crankPriority = crankPriority;
	}

	EnginePosition Operation_EnginePosition::Execute(ReluctorResult crankPosition, ReluctorResult camPosition)
	{
		EnginePosition ret;
		ret.Synced = false;

		if(crankPosition.Synced)
		{
			if(camPosition.Synced)
			{
				//we have both crank and cam
				//decide which one to use for scheduling.
				if(_crankPriority)
				{
					ret.Synced = true;
					ret.Position = crankPosition.Position;
					ret.PositionDot = crankPosition.PositionDot;
					float decision = camPosition.Position * 2 - crankPosition.Position;
					if(decision > 180 || decision < -180)
					{
						//we are on the second half of the cam
						ret.Position += 360;
					}
					ret.Sequential = true;
					ret.CalculatedTick = crankPosition.CalculatedTick;
				}
				else
				{
					//the crank reluctor is essential useless unless the cam sensor goes out of sync
					ret.Synced = true;
					ret.Position = camPosition.Position * 2;
					ret.PositionDot = camPosition.PositionDot * 2;
					ret.Sequential = true;
					ret.CalculatedTick = camPosition.CalculatedTick;
				}
			}
			else
			{
				//we only have the crank sensor
				ret.Synced = true;
				ret.Position = crankPosition.Position;
				ret.PositionDot = crankPosition.PositionDot;
				ret.Sequential = false;
				ret.CalculatedTick = crankPosition.CalculatedTick;
			}
		}
		else if(camPosition.Synced)
		{
			//we only have the cam sensor
			ret.Synced = true;
			ret.Position = camPosition.Position * 2;
			ret.PositionDot = camPosition.PositionDot * 2;
			ret.Sequential = true;
			ret.CalculatedTick = camPosition.CalculatedTick;
		}

		//todo error checking
		_previousPreviousReluctorResult = _previousReluctorResult;
		_previousReluctorResult = ret;
		return ret;
	}
	
	Operations::IOperationBase *Operation_EnginePosition::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		return new Operation_EnginePosition(IService::CastAndOffset<bool>(config, sizeOut));
	}
	
	IOPERATION_REGISTERFACTORY_CPP(Operation_EnginePosition, 2001)
}
#endif