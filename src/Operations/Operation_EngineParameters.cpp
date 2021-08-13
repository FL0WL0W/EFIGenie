#include "Operations/Operation_EngineParameters.h"
#include "Config.h"

#ifdef OPERATION_ENGINEPARAMETERS_H
namespace OperationArchitecture
{
	std::tuple<float, bool> Operation_EngineParameters::Execute(EnginePosition enginePosition)
	{
		_sequential = enginePosition.Sequential;
		return std::tuple<float, bool>(enginePosition.GetRPM(), _sequential);
	}
	
	Operation_EngineParameters Operation_EngineParameters::Instance;
}
#endif