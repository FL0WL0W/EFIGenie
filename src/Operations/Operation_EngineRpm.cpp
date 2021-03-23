#include "Operations/Operation_EngineRpm.h"

#ifdef OPERATION_ENGINERPM_H
namespace OperationArchitecture
{
	Operation_EngineRpm *Operation_EngineRpm::_instance = 0;
	
	float Operation_EngineRpm::Execute(EnginePosition enginePosition)
	{
		return enginePosition.GetRPM();
	}
	
	IOperationBase *Operation_EngineRpm::Create(const void *config, unsigned int &sizeOut)
	{
		return new Operation_EngineRpm();
	}
	
	Operation_EngineRpm *Operation_EngineRpm::Construct()
	{
		if(_instance == 0)
			_instance = new Operation_EngineRpm();
		return _instance;
	}
}
#endif