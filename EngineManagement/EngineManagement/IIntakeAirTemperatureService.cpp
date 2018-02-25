#include "Services.h"
#include "IntakeAirTemperatureService_Static.h"
#include "IntakeAirTemperatureService_Analog.h"

#ifdef IIntakeAirTemperatureServiceExists
namespace EngineManagement
{
	IIntakeAirTemperatureService *CurrentIntakeAirTemperatureService;

	IIntakeAirTemperatureService* CreateIntakeAirTemperatureService(void *config)
	{
		unsigned char iatId = *((unsigned char*)config);
		switch (iatId)
		{
#ifdef IntakeAirTemperatureService_StaticExists
		case 0:
			return new EngineManagement::IntakeAirTemperatureService_Static(*((float *)((unsigned char*)config + 1)), *((float *)((unsigned char*)config + 1) + 1));
#endif
#ifdef IntakeAirTemperatureService_AnalogExists
		case 1:
			return new EngineManagement::IntakeAirTemperatureService_Analog((void *)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif