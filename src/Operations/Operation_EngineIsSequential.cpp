#include "Operations/Operation_EngineIsSequential.h"
#include "Config.h"

#ifdef OPERATION_ENGINEISSEQUENTIAL_H
namespace OperationArchitecture
{
	Operation_EngineIsSequential *Operation_EngineIsSequential::_instance = 0;
	
	bool Operation_EngineIsSequential::Execute(EnginePosition enginePosition)
	{
		return enginePosition.Sequential;
	}
	
	IOperationBase *Operation_EngineIsSequential::Create(const void *config, unsigned int &sizeOut)
	{
		return new Operation_EngineIsSequential();
	}
	
	Operation_EngineIsSequential *Operation_EngineIsSequential::Construct()
	{
		if(_instance == 0)
			_instance = new Operation_EngineIsSequential();
		return _instance;
	}
}
#endif