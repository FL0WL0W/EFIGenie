#include "Services.h"
#include "FuelPumpService.h"

#ifdef IFuelPumpServiceExists
namespace EngineManagement
{
	IFuelPumpService *CurrentFuelPumpService;

	IFuelPumpService* CreateFuelPumpService(void *config, bool fuelPumpHighZ)
	{
		unsigned char fuelpumpServiceId = *((unsigned char*)config);
		switch (fuelpumpServiceId)
		{
#ifdef FuelPumpServiceExists
		case 0:
			return new FuelPumpService((void*)((unsigned char*)config + 1), fuelPumpHighZ);
#endif
		}
	}
}
#endif