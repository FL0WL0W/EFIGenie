#include "Operations/Operation_EngineParameters.h"
#include "Config.h"

#ifdef OPERATION_ENGINEPARAMETERS_H
namespace EFIGenie
{
	std::tuple<float, bool, bool> Operation_EngineParameters::Execute(EnginePosition enginePosition)
	{
		_sequential = enginePosition.Sequential;
		_synced = enginePosition.Synced;
		return std::tuple<float, bool, bool>(enginePosition.GetRPM(), _sequential, _synced);
	}
}
#endif