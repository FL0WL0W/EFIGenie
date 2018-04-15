#include "PistonEngineConfig.h"
#include "IPistonEngineInjectionConfig.h"
#include "PistonEngineInjectionConfig_SD.h"
#include "PistonEngineInjectionConfigWrapper_DFCO.h"

#ifdef IPistonEngineInjectionConfigExists
namespace EngineManagement
{
	IPistonEngineInjectionConfig *CurrentPistonEngineInjectionConfig;

	IPistonEngineInjectionConfig* CreatePistonEngineInjectionConfig(void *config)
	{
		unsigned char pistonEngineInjectionConfigId = *((unsigned char*)config);
		switch (pistonEngineInjectionConfigId)
		{
#ifdef PistonEngineInjectionConfig_SDExists
		case 1:
			return new EngineManagement::PistonEngineInjectionConfig_SD((void*)((unsigned char*)config + 1));
#endif
#ifdef PistonEngineInjectionConfigWrapper_DFCOExists
		case 2:
			return new EngineManagement::PistonEngineInjectionConfigWrapper_DFCO((void*)((unsigned char*)config + 1));
#endif
		}
		return 0;
	}
}
#endif