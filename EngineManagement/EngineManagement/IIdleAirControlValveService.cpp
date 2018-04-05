#include "Services.h"
#include "IdleAirControlValveService_Pwm.h"
#include "IdleAirControlValveService_Stepper.h"

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
#ifdef IdleAirControlValveService_PwmExists
		case 1:
			return new IdleAirControlValveService_Pwm(IdleAirControlValveService_PwmConfig::Cast((unsigned char*)config + 1));
#endif
#ifdef IdleAirControlValveService_StepperExists
		case 2:
			return new IdleAirControlValveService_Stepper(IdleAirControlValveService_StepperConfig::Cast((unsigned char*)config + 1));
#endif
		}
	}
}
#endif