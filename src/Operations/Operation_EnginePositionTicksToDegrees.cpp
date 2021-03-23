#include "Operations/Operation_EnginePositionTicksToDegrees.h"

#ifdef OPERATION_ENGINEPOSITIONTICKSTODEGREES_H
namespace OperationArchitecture
{
	Operation_EnginePositionTicksToDegrees *Operation_EnginePositionTicksToDegrees::_instance = 0;

	float Operation_EnginePositionTicksToDegrees::Execute(uint32_t  ticks, EnginePosition enginePosition)
	{
		return ticks * enginePosition.PositionDot / enginePosition.TicksPerSecond;
	}

	IOperationBase *Operation_EnginePositionTicksToDegrees::Create(const void *config, unsigned int &sizeOut)
	{
		if(_instance == 0)
			_instance = new Operation_EnginePositionTicksToDegrees();
		return _instance;
	}
}
#endif