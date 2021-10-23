#include "Operations/EngineOperationFactoryRegister.h"
#include "Operations/Operation_CylinderAirMass_SD.h"
#include "Operations/Operation_EngineInjectorPrime.h"
#include "Operations/Operation_EnginePosition.h"
#include "Operations/Operation_EngineParameters.h"
#include "Operations/Operation_EngineScheduleIgnition.h"
#include "Operations/Operation_EngineScheduleInjection.h"
#include "Operations/Operation_InjectorDeadTime.h"

using namespace EmbeddedIOServices;

#ifdef ENGINEOPERATIONFACTORYREGISTER_H

namespace OperationArchitecture
{
    void EngineOperationFactoryRegister::Register(uint32_t idOffset, OperationFactory *factory, const EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager)
    {
        factory->Register(idOffset + 1, Operation_CylinderAirMass_SD::Create);
        factory->Register(idOffset + 2, [embeddedIOServiceCollection, packager](const void *config, size_t &sizeOut) { return Operation_EngineInjectorPrime::Create(config, sizeOut, embeddedIOServiceCollection, packager); });
        factory->Register(idOffset + 3, &Operation_EnginePosition::InstanceCrankPriority);
        factory->Register(idOffset + 4, &Operation_EnginePosition::InstanceCamPriority);
        factory->Register(idOffset + 5, &Operation_EngineParameters::Instance);
        factory->Register(idOffset + 6, [embeddedIOServiceCollection, packager](const void *config, size_t &sizeOut) { return Operation_EngineScheduleIgnition::Create(config, sizeOut, embeddedIOServiceCollection, packager); });
        factory->Register(idOffset + 7, [embeddedIOServiceCollection, packager](const void *config, size_t &sizeOut) { return Operation_EngineScheduleInjection::Create(config, sizeOut, embeddedIOServiceCollection, packager); });
        factory->Register(idOffset + 8, Operation_InjectorDeadTime::Create);
    }
}

#endif