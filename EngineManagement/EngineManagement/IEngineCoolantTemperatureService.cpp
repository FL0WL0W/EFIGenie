#include "Services.h"
#include "EngineCoolantTemperatureService_Static.h"
#include "EngineCoolantTemperatureService_Analog.h"

#ifdef IEngineCoolantTemperatureServiceExists
namespace EngineManagement
{
	IEngineCoolantTemperatureService *CurrentEngineCoolantTemperatureService;

	IEngineCoolantTemperatureService* CreateEngineCoolantTemperatureService(void *config)
	{
		unsigned char ectId = *((unsigned char*)config);
		switch (ectId)
		{
#ifdef EngineCoolantTemperatureService_StaticExists
		case 0:
			return new EngineCoolantTemperatureService_Static(*((float *)((unsigned char*)config + 1)), *((float *)((unsigned char*)config + 1) + 1));
#endif
#ifdef EngineCoolantTemperatureService_AnalogExists
		case 1:
			return new EngineCoolantTemperatureService_Analog((void *)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif