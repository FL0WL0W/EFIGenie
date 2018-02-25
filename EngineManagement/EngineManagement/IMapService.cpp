#include "Services.h"
#include "MapService_Analog.h"

#ifdef IMapServiceExists
namespace EngineManagement
{
	IMapService *CurrentMapService;

	IMapService* CreateMapService(void *config)
	{
		unsigned char mapServiceId = *((unsigned char*)config);
		switch (mapServiceId)
		{
#ifdef MapService_AnalogExists
		case 1:
			return new EngineManagement::MapService_Analog((void *)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif