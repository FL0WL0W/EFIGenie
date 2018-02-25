#include "Services.h"
#include "TpsService_Analog.h"

#ifdef ITpsServiceExists
namespace EngineManagement
{
	ITpsService *CurrentThrottlePositionService;

	ITpsService* CreateThrottlePositionService(void *config)
	{
		unsigned char tpsId = *((unsigned char*)config);
		switch (tpsId)
		{
			//TODO
#ifdef TpsService_StaticExists
		case 0:
			return new EngineManagement::TpsService_Static(*((float *)((unsigned char*)config + 1)), *((float *)((unsigned char*)config + 1) + 1), *((float *)((unsigned char*)config + 1) + 2));
#endif
#ifdef TpsService_AnalogExists
		case 1:
			return new EngineManagement::TpsService_Analog((void *)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif