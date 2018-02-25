#include "Services.h"
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"
#include "PistonEngineIgnitionConfigWrapper_HardRpmLimit.h"
#include "PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit.h"

#if defined(IPistonEngineIgnitionConfigExists)
namespace EngineManagement
{
	IPistonEngineIgnitionConfig *CurrentPistonEngineIgnitionConfig;

	IPistonEngineIgnitionConfig* CreatePistonEngineIgnitionConfig(void *config)
	{
		unsigned char pistonEngineIgnitionConfigId = *((unsigned char*)config);
		switch (pistonEngineIgnitionConfigId)
		{
#ifdef PistonEngineIgnitionConfig_Map_EthanolExists
		case 1:
			return new EngineManagement::PistonEngineIgnitionConfig_Map_Ethanol((void*)((unsigned char*)config + 1));
#endif
#ifdef PistonEngineIgnitionConfigWrapper_HardRpmLimitExists
		case 2:
			return new EngineManagement::PistonEngineIgnitionConfigWrapper_HardRpmLimit((void*)((unsigned char*)config + 1));
#endif
#ifdef PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitExists
		case 3:
			return new EngineManagement::PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit((void*)((unsigned char*)config + 1));
#endif
		}
		return 0;
	}
}
#endif