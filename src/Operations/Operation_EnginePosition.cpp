#include "Operations/Operation_EnginePosition.h"
#include "Config.h"

#ifdef OPERATION_ENGINEPOSITION_H
namespace OperationArchitecture
{
	Operation_EnginePosition *Operation_EnginePosition::_instanceTrue = 0;
	Operation_EnginePosition *Operation_EnginePosition::_instanceFalse = 0;

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
	
	IOperationBase *Operation_EnginePosition::Create(const void *config, size_t &sizeOut)
	{
		return Construct(Config::CastAndOffset<bool>(config, sizeOut));
	}

	Operation_EnginePosition *Operation_EnginePosition::Construct(bool crankPriority)
	{
		if(crankPriority)
		{
			if(_instanceTrue == 0)
				_instanceTrue = new Operation_EnginePosition(true);
			return _instanceTrue;
		}
		else
		{
			if(_instanceFalse == 0)
				_instanceFalse = new Operation_EnginePosition(false);
			return _instanceFalse;
		}
	}
}
#endif