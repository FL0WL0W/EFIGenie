#include "Services.h"
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
		}
	}
}
#endif