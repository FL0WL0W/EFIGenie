#include "Operations/EngineOperationFactoryRegister.h"
#include "Operations/Operation_CylinderAirMass_SD.h"
#include "Operations/Operation_EngineInjectorPrime.h"
#include "Operations/Operation_EnginePosition.h"
#include "Operations/Operation_EnginePositionPrediction.h"
#include "Operations/Operation_EngineRpm.h"
#include "Operations/Operation_EngineScheduleIgnition.h"
#include "Operations/Operation_EngineScheduleInjection.h"
#include "Operations/Operation_EngineIsSequential.h"

using namespace EmbeddedIOServices;

#ifdef ENGINEOPERATIONFACTORYREGISTER_H

namespace OperationArchitecture
{
    void EngineOperationFactoryRegister::Register(uint32_t idOffset, OperationFactory *factory, const EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager)
    {
        factory->Register(idOffset + 1, Operation_CylinderAirMass_SD::Create);
        factory->Register(idOffset + 2, new CreateWithParameters<const EmbeddedIOServiceCollection *, OperationPackager *>(Operation_EngineInjectorPrime::Create, embeddedIOServiceCollection, packager));
        factory->Register(idOffset + 3, Operation_EnginePosition::Create);
        factory->Register(idOffset + 4, new CreateWithParameters<const EmbeddedIOServiceCollection *>(Operation_EnginePositionPrediction::Create, embeddedIOServiceCollection));
        factory->Register(idOffset + 5, Operation_EngineRpm::Create);
        factory->Register(idOffset + 6, new CreateWithParameters<const EmbeddedIOServiceCollection *, OperationPackager *>(Operation_EngineScheduleIgnition::Create, embeddedIOServiceCollection, packager));
        factory->Register(idOffset + 7, new CreateWithParameters<const EmbeddedIOServiceCollection *, OperationPackager *>(Operation_EngineScheduleInjection::Create, embeddedIOServiceCollection, packager));
        factory->Register(idOffset + 8, Operation_EngineIsSequential::Create);
    }
}

#endif