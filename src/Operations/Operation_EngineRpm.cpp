#include "Operations/Operation_EngineRpm.h"

#ifdef OPERATION_ENGINERPM_H
namespace OperationArchitecture
{
	Operation_EngineRpm::Operation_EngineRpm()
	{
	}

	float Operation_EngineRpm::Execute(EnginePosition enginePosition)
	{
		return enginePosition.PositionDot / 60;
	}
	
	IOperationBase *Operation_EngineRpm::Create(const void *config, unsigned int &sizeOut)
	{
		return new Operation_EngineRpm();
	}
}
#endif