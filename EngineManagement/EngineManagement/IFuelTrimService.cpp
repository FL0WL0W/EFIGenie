#include "Services.h"
#include "FuelTrimService_Simple.h"

#ifdef IFuelTrimServiceExists
namespace EngineManagement
{
	IFuelTrimService *CurrentFuelTrimService;

	
	IFuelTrimService *CreateFuelTrimService(void *config)
	{
		unsigned char fuelTrimId = *((unsigned char*)config);
		switch (fuelTrimId)
		{
		case 0:
			return 0;
#ifdef FuelTrimService_SimpleExists
		case 1:
			return new FuelTrimService_Simple((void*)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif