#include "Services.h"
#include "FuelPumpService.h"
#include "stdlib.h"
#include "FuelPumpService_Pwm.h"

#ifdef IFuelPumpServiceExists
namespace EngineManagement
{
	IFuelPumpService *CurrentFuelPumpService;

	IFuelPumpService* CreateFuelPumpService(void *config, bool fuelPumpHighZ)
	{
		unsigned char fuelpumpServiceId = *((unsigned char*)config);
		switch (fuelpumpServiceId)
		{
		case 0:
			return 0;
#ifdef FuelPumpServiceExists
		case 1:
			return new FuelPumpService(FuelPumpServiceConfig::Cast((unsigned char*)config + 1), fuelPumpHighZ);
#endif
#ifdef FuelPumpService_PwmExists
		case 2:
			return new FuelPumpService_Pwm(FuelPumpService_PwmConfig::Cast(((unsigned char*)config + 1)));
#endif
		}
	}
}
#endif