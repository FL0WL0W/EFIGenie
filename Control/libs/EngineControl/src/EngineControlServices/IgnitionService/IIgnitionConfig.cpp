#include "EngineControlServices/IgnitionService/IIgnitionConfig.h"
#include "Service/EngineControlServiceIds.h"
#include "Service/ServiceBuilder.h"
#include "EngineControlServices/IgnitionService/IIgnitionConfig.h"
#include "EngineControlServices/IgnitionService/IgnitionConfig_Map_Ethanol.h"
#include "EngineControlServices/IgnitionService/IgnitionConfig_Static.h"
#include "EngineControlServices/IgnitionService/IgnitionConfigWrapper_HardRpmLimit.h"
#include "EngineControlServices/IgnitionService/IgnitionConfigWrapper_SoftPidRpmLimit.h"

namespace EngineControlServices
{
	void* IIgnitionConfig::CreateIgnitionConfig(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{	
		IIgnitionConfig *ret = 0;
		
		switch (ServiceBuilder::GetServiceTypeId(config, sizeOut))
		{
#ifdef IGNITIONCONFIG_STATIC_H
		case 1:
			ret = new IgnitionConfig_Static(
				ServiceBuilder::CastConfig < IgnitionConfig_StaticConfig >(config, sizeOut));
			break;
#endif
#ifdef IGNITIONCONFIG_MAP_ETHANOL_H
		case 2:
			ret = new IgnitionConfig_Map_Ethanol(
				ServiceBuilder::CastConfig < IgnitionConfig_Map_EthanolConfig >(config, sizeOut),
				serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(ETHANOL_CONTENT_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID));
			break;
#endif
#ifdef IGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H
		case 3:
			{
				const IgnitionConfigWrapper_HardRpmLimitConfig *ignitionConfig = ServiceBuilder::CastConfig < IgnitionConfigWrapper_HardRpmLimitConfig >(config, sizeOut);

				IBooleanInputService *booleanInputService = ServiceBuilder::CreateServiceAndOffset<IBooleanInputService>(IBooleanInputService::CreateBooleanInputService, serviceLocator, config, sizeOut);
				
				IIgnitionConfig *child = ServiceBuilder::CreateServiceAndOffset<IIgnitionConfig>(IIgnitionConfig::CreateIgnitionConfig, serviceLocator, config, sizeOut);
				
				ret = new IgnitionConfigWrapper_HardRpmLimit(
					ignitionConfig,  
					serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID),
					booleanInputService,
					child);
				
				break;
			}
#endif
#ifdef IGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H
		case 4:
			{
				const IgnitionConfigWrapper_SoftPidRpmLimitConfig *ignitionConfig = ServiceBuilder::CastConfig < IgnitionConfigWrapper_SoftPidRpmLimitConfig >(config, sizeOut);

				IBooleanInputService *booleanInputService = ServiceBuilder::CreateServiceAndOffset<IBooleanInputService>(IBooleanInputService::CreateBooleanInputService, serviceLocator, config, sizeOut);
				
				IIgnitionConfig *child = ServiceBuilder::CreateServiceAndOffset<IIgnitionConfig>(IIgnitionConfig::CreateIgnitionConfig, serviceLocator, config, sizeOut);
				
				ret = new IgnitionConfigWrapper_SoftPidRpmLimit(
					ignitionConfig,
					serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID), 
					serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID),
					booleanInputService,
					child);
				
				break;
			}
#endif
		}
		return ret;
	}
}