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
	Operation_EnginePosition *Operation_EnginePositionInstanceCrankPriority;
	Operation_EnginePosition *Operation_EnginePositionInstanceCamPriority;
    Operation_EngineParameters * Operation_EngineParametersInstance;

    void EngineOperationFactoryRegister::Register(uint32_t idOffset, OperationFactory *factory, const EmbeddedIOServiceCollection *embeddedIOServiceCollection)
    {
        factory->Register(idOffset + 1, Operation_CylinderAirMass_SD::Create);
        factory->Register(idOffset + 2, [embeddedIOServiceCollection, factory](const void *config, size_t &sizeOut) { return Operation_EngineInjectorPrime::Create(config, sizeOut, embeddedIOServiceCollection, factory); });
        factory->Register(idOffset + 3, Operation_EnginePositionInstanceCrankPriority == 0 ? Operation_EnginePositionInstanceCrankPriority = new Operation_EnginePosition(true) : Operation_EnginePositionInstanceCrankPriority);
        factory->Register(idOffset + 4, Operation_EnginePositionInstanceCamPriority == 0 ? Operation_EnginePositionInstanceCamPriority = new Operation_EnginePosition(false) : Operation_EnginePositionInstanceCamPriority);
        factory->Register(idOffset + 5, Operation_EngineParametersInstance == 0 ? Operation_EngineParametersInstance = new Operation_EngineParameters() : Operation_EngineParametersInstance);
        factory->Register(idOffset + 6, [embeddedIOServiceCollection, factory](const void *config, size_t &sizeOut) { return Operation_EngineScheduleIgnition::Create(config, sizeOut, embeddedIOServiceCollection, factory); });
        factory->Register(idOffset + 7, [embeddedIOServiceCollection, factory](const void *config, size_t &sizeOut) { return Operation_EngineScheduleInjection::Create(config, sizeOut, embeddedIOServiceCollection, factory); });
        factory->Register(idOffset + 8, Operation_InjectorDeadTime::Create);
    }
}
#endif