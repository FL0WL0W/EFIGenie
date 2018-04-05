#include "Services.h"
#include "SensorService_Static.h"
#include "SensorService_Analog.h"
#include "SensorService_Frequency.h"

#ifdef ISensorServiceExists
namespace EngineManagement
{
	ISensorService* CreateSensorService(void *config)
	{
		unsigned char sensorId = *((unsigned char*)config);
		switch (sensorId)
		{
		case 0:
			return 0;
#ifdef SensorService_StaticExists
		case 1:
			return new EngineManagement::SensorService_Static(*((float *)((unsigned char*)config + 1)), *((float *)((unsigned char*)config + 1) + 1));
#endif
#ifdef SensorService_AnalogExists
		case 2:
			return new EngineManagement::SensorService_Analog(SensorService_AnalogConfig::Cast((unsigned char*)config + 1));
#endif
#ifdef SensorService_FrequencyExists
		case 3:
			return new EngineManagement::SensorService_Frequency(SensorService_FrequencyConfig::Cast((unsigned char*)config + 1));
#endif
		}
	}
}
#endif