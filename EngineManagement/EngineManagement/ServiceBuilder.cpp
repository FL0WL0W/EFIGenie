#include "ServiceBuilder.h"

namespace Service
{
	ServiceLocator *ServiceBuilder::CreateServices(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *totalSize)
	{
		ServiceLocator *serviceLocator = new ServiceLocator();

		serviceLocator->Register(HARDWARE_ABSTRACTION_COLLECTION_ID, (void *)hardwareAbstractionCollection);

		*totalSize = 0;
		unsigned int size;
		unsigned char serviceId;

		while ((serviceId = *(unsigned char *)config) != 0)
		{
			config = (void *)((unsigned char *)config + 1);
			*totalSize++;

			switch (serviceId)
			{
#ifdef INTAKE_AIR_TEMPERATURE_SERVICE_ID
			case INTAKE_AIR_TEMPERATURE_SERVICE_ID:
#endif
#ifdef ENGINE_COOLANT_TEMPERATURE_SERVICE_ID
			case ENGINE_COOLANT_TEMPERATURE_SERVICE_ID:
#endif
#ifdef MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID
			case MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID:
#endif
#ifdef VOLTAGE_SERVICE_ID
			case VOLTAGE_SERVICE_ID:
#endif
#ifdef THROTTLE_POSITION_SERVICE_ID
			case THROTTLE_POSITION_SERVICE_ID:
#endif
#ifdef ETHANOL_CONTENT_SERVICE_ID
			case ETHANOL_CONTENT_SERVICE_ID:
#endif
#ifdef VEHICLE_SPEED_SERVICE_ID
			case VEHICLE_SPEED_SERVICE_ID:
#endif
				{
					serviceLocator->Register(serviceId, IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#ifdef IGNITOR_SERVICES_ID
			case IGNITOR_SERVICES_ID:
#endif
#ifdef INJECTOR_SERVICES_ID
			case INJECTOR_SERVICES_ID:
#endif
				{
					unsigned char numberOfServices = *(unsigned char *)config;
					config = (void *)((unsigned char *)config + 1);
					*totalSize++;

					IBooleanOutputService *serviceArray[numberOfServices];
					for (int i = 0; i < numberOfServices; i++)
					{
						serviceArray[i] = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &size, BOOLEANOUTPUTSERVICE_HIGHZ);
						config = (void *)((unsigned char *)config + size);
						*totalSize += size;
					}
					serviceLocator->Register(serviceId, serviceArray);
					break;
				}
#ifdef TACHOMETER_SERVICE_ID
			case TACHOMETER_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, TachometerService::CreateTachometerService(serviceLocator, config, &size)); //needs BooleanOutputService, TimerService and Decoder
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
			}
		}

		return serviceLocator;
	}
}