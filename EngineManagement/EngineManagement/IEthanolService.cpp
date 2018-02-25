#include "Services.h"
#include "EthanolService_Static.h"
#include "EthanolService_Analog.h"
#include "EthanolService_Pwm.h"

#ifdef IEthanolServiceExists
namespace EngineManagement
{
	IEthanolService *CurrentEthanolService;

	IEthanolService* CreateEthanolService(void *config)
	{
		unsigned char ethanolServiceId = *((unsigned char*)config);
		switch (ethanolServiceId)
		{
#ifdef EthanolService_StaticExists
		case 0:
			return new EngineManagement::EthanolService_Static(*((float*)((unsigned char*)config + 1)));
#endif
#ifdef EthanolService_AnalogExists
		case 1:
			return new EngineManagement::EthanolService_Analog((void*)((unsigned char*)config + 1));
#endif
#ifdef EthanolService_PwmExists
		case 2:
			return new EngineManagement::EthanolService_Pwm((void*)((unsigned char*)config + 1));
		}
#endif
	}
}
#endif