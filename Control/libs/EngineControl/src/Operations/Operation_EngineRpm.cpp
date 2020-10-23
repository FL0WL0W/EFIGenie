#include "Operations/Operation_EngineRpm.h"

#ifdef OPERATION_ENGINERPM_H
namespace Operations
{
	Operation_EngineRpm::Operation_EngineRpm()
	{
	}

	ScalarVariable Operation_EngineRpm::Execute(EnginePosition enginePosition)
	{
		return ScalarVariable(enginePosition.PositionDot / 60);
	}
	
	Operations::IOperationBase *Operation_EngineRpm::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		return new Operation_EngineRpm();
	}
	
	IOPERATION_REGISTERFACTORY_CPP(Operation_EngineRpm, 2004)
}
#endif