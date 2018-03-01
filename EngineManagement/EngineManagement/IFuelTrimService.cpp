#include "Services.h"
#include "FuelTrimServiceWrapper_InterpolatedTable.h"

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
#ifdef FuelTrimServiceWrapper_InterpolatedTableExists
		case 1:
			return new FuelTrimServiceWrapper_InterpolatedTable((void*)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif