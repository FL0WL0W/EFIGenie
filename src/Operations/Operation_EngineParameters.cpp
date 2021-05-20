#include "Operations/Operation_EngineParameters.h"
#include "Config.h"

#ifdef OPERATION_ENGINEPARAMETERS_H
namespace OperationArchitecture
{
	Operation_EngineParameters *Operation_EngineParameters::_instance = 0;
	
	std::tuple<float, bool> Operation_EngineParameters::Execute(EnginePosition enginePosition)
	{
		_sequential = enginePosition.Sequential;
		return std::tuple<float, bool>(enginePosition.GetRPM(), _sequential);
	}
	
	IOperationBase *Operation_EngineParameters::Create(const void *config, size_t &sizeOut)
	{
		return new Operation_EngineParameters();
	}
	
	Operation_EngineParameters *Operation_EngineParameters::Construct()
	{
		if(_instance == 0)
			_instance = new Operation_EngineParameters();
		return _instance;
	}
}
#endif