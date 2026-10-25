#include "Operations/EngineOperationFactoryRegister.h"
#include "Operations/Operation_CylinderAirMass_SD.h"
#include "Operations/Operation_EngineInjectorPrime.h"
#include "Operations/Operation_EnginePosition.h"
#include "Operations/Operation_EngineParameters.h"
#include "Operations/Operation_EngineScheduleIgnition.h"
#include "Operations/Operation_EngineScheduleInjection.h"
#include "Operations/Operation_InjectorDeadTime.h"

using namespace OperationArchitecture;
using namespace EmbeddedIOOperations;

#ifdef ENGINEOPERATIONFACTORYREGISTER_H
namespace EFIGenie
{
	Operation_EnginePosition Operation_EnginePositionInstanceCrankPriority(true);
	Operation_EnginePosition Operation_EnginePositionInstanceCamPriority(false);
    Operation_EngineParameters Operation_EngineParametersInstance;
}
#endif