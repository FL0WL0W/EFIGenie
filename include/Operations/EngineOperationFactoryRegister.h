#include "Operations/OperationFactory.h"
#include "ServiceRegistry.h"
#include "Operations/Operation_CylinderAirMass_SD.h"
#include "Operations/Operation_EngineInjectorPrime.h"
#include "Operations/Operation_EnginePosition.h"
#include "Operations/Operation_EngineParameters.h"
#include "Operations/Operation_EngineScheduleIgnition.h"
#include "Operations/Operation_EngineScheduleInjection.h"
#include "Operations/Operation_InjectorDeadTime.h"

#ifndef ENGINEOPERATIONFACTORYREGISTER_H
#define ENGINEOPERATIONFACTORYREGISTER_H
namespace EFIGenie
{
	extern Operation_EnginePosition Operation_EnginePositionInstanceCrankPriority;
	extern Operation_EnginePosition Operation_EnginePositionInstanceCamPriority;
    extern Operation_EngineParameters Operation_EngineParametersInstance;

	template<uint32_t idOffset, OperationArchitecture::OperationFactory *factory, EmbeddedIOOperations::ServiceRegistry *serviceRegistry>
	constexpr auto RegisterEngineOperationFactory = []() {
    	return std::array<OperationArchitecture::OperationFactoryEntry, 8>{{
        	{ idOffset + 1, Operation_CylinderAirMass_SD::Create },
        	{ idOffset + 2, [](const void *config, size_t &sizeOut) { return Operation_EngineInjectorPrime::Create(config, sizeOut, serviceRegistry, factory); } },
        	{ idOffset + 3, [](const void *config, size_t &sizeOut) { return static_cast<OperationArchitecture::AbstractOperation *>(&Operation_EnginePositionInstanceCrankPriority); } },
        	{ idOffset + 4, [](const void *config, size_t &sizeOut) { return static_cast<OperationArchitecture::AbstractOperation *>(&Operation_EnginePositionInstanceCamPriority); } },
        	{ idOffset + 5, [](const void *config, size_t &sizeOut) { return static_cast<OperationArchitecture::AbstractOperation *>(&Operation_EngineParametersInstance); } },
        	{ idOffset + 6, [](const void *config, size_t &sizeOut) { return Operation_EngineScheduleIgnition::Create(config, sizeOut, serviceRegistry, factory); } },
        	{ idOffset + 7, [](const void *config, size_t &sizeOut) { return Operation_EngineScheduleInjection::Create(config, sizeOut, serviceRegistry, factory); } },
        	{ idOffset + 8, Operation_InjectorDeadTime::Create }
    	}};
	};
}
#endif