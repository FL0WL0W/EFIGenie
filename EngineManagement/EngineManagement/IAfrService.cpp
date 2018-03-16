#include "Services.h"
#include "AfrService_Static.h"
#include "AfrService_Map_Ethanol.h"

#ifdef IAfrServiceExists
namespace EngineManagement
{
	IAfrService *CurrentAfrService;
	IAfrService* CreateAfrService(void *config)
	{
		unsigned char afrServiceId = *((unsigned char*)config);
		switch (afrServiceId)
		{
			return 0;
#ifdef AfrService_StaticExists
		case 1:
			return new EngineManagement::AfrService_Static(*((float*)((unsigned char*)config + 1)));
#endif
#ifdef AfrService_Map_EthanolExists
		case 2:
			return new EngineManagement::AfrService_Map_Ethanol((void*)((unsigned char*)config + 1));;
#endif
		}
	}
}
#endif