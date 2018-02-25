#include "Services.h"
#include "VoltageService_Static.h"
#include "VoltageService_Analog.h"

#ifdef IVoltageServiceExists
namespace EngineManagement
{
	IVoltageService *CurrentVoltageService;

	IVoltageService* CreateVoltageService(void *config)
	{
		unsigned char voltageId = *((unsigned char*)config);
		switch (voltageId)
		{
#ifdef VoltageService_StaticExists
		case 0:
			return new EngineManagement::VoltageService_Static(*((float *)((unsigned char*)config + 1)), *((float *)((unsigned char*)config + 1) + 1));
#endif
#ifdef VoltageService_AnalogExists
		case 1:
			return new EngineManagement::VoltageService_Analog((void *)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif