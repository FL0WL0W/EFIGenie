#include "Services.h"
#include "IdleAirControlValveService_Pwm.h"

#ifdef IIdleAirControlValveServiceExists
namespace EngineManagement
{
	IIdleAirControlValveService *CurrentIdleAirControlValveService;
	IIdleAirControlValveService* CreateIdleAirControlValveService(void *config)
	{
		unsigned char idleAirControlValveServiceId = *((unsigned char*)config);
		switch (idleAirControlValveServiceId)
		{
		case 0:
			return 0;
#ifdef IdleAirControlValveService_PidExists
		case 1:
			return new IdleAirControlValveService_Pwm((void*)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif