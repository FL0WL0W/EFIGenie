#include "ServiceBuilder.h"

namespace Service
{
	ServiceLocator *ServiceBuilder::CreateServices(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *totalSize)
	{
		ServiceLocator *serviceLocator = new ServiceLocator();

		serviceLocator->Register(HARDWARE_ABSTRACTION_COLLECTION_ID, (void *)hardwareAbstractionCollection);
		serviceLocator->Register(ANALOG_SERVICE_ID, (void *)hardwareAbstractionCollection->AnalogService);
		serviceLocator->Register(DIGITAL_SERVICE_ID, (void *)hardwareAbstractionCollection->DigitalService);
		serviceLocator->Register(PWM_SERVICE_ID, (void *)hardwareAbstractionCollection->PwmService);
		serviceLocator->Register(TIMER_SERVICE_ID, (void *)hardwareAbstractionCollection->TimerService);

		*totalSize = 0;
		unsigned int size;
		unsigned short serviceId;

		while ((serviceId = *(unsigned short *)config) != 0)
		{
			config = (void *)((unsigned short *)config + 1);
			*totalSize += 2;

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

					IBooleanOutputService *serviceArray[numberOfServices + 1];
					for (int i = 0; i < numberOfServices; i++)
					{
						serviceArray[i] = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &size, BOOLEAN_OUTPUT_SERVICE_HIGHZ);
						config = (void *)((unsigned char *)config + size);
						*totalSize += size;
					}
					serviceArray[numberOfServices] = 0;
					serviceLocator->Register(serviceId, serviceArray);
					break;
				}
#ifdef TACHOMETER_SERVICE_ID
			case TACHOMETER_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateTachometerService(serviceLocator, config, &size)); //needs BooleanOutputService, TimerService and Decoder
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#ifdef IDLE_AIR_CONTROL_VALVE_SERVICE_ID
			case IDLE_AIR_CONTROL_VALVE_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &size, BOOLEAN_OUTPUT_SERVICE_HIGHZ));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#ifdef PRIME_SERVICE_ID
			case PRIME_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreatePrimeService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#ifdef IDLE_CONTROL_SERVICE_ID
			case IDLE_CONTROL_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateIdleControlService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#ifdef AFR_SERVICE_ID
			case AFR_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateAfrService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#ifdef FUEL_TRIM_SERVICE_ID
			case FUEL_TRIM_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateFuelTrimService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
			}
		}

		return serviceLocator;
	}
	
	TachometerService *ServiceBuilder::CreateTachometerService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		HardwareAbstractionCollection *hardwareAbstractionCollection = 0;
#if defined(HARDWARE_ABSTRACTION_COLLECTION_ID)
		hardwareAbstractionCollection = (HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID);
#endif
		
		IDecoder *decoder = 0;
#ifdef DECODER_SERVICE_ID
		decoder = (IDecoder *)serviceLocator->Locate(DECODER_SERVICE_ID);
#endif
		
		TachometerServiceConfig *tachometerConfig = TachometerServiceConfig::Cast(config);
		config = (void *)((unsigned char *)config + tachometerConfig->Size());
		*totalSize = tachometerConfig->Size();
		
		unsigned int size;
		IBooleanOutputService *booleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &size, BOOLEAN_OUTPUT_SERVICE_HIGHZ);
		config = (void *)((unsigned char *)config + size);
		*totalSize += size;
		
		if (booleanOutputService == 0)
			return 0;
		
		if (hardwareAbstractionCollection == 0 || decoder == 0)
		{
			delete booleanOutputService;
			return 0;
		}
		
		return new TachometerService(tachometerConfig, booleanOutputService, hardwareAbstractionCollection->TimerService, decoder);
	}
	
	IPrimeService* ServiceBuilder::CreatePrimeService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		HardwareAbstractionCollection *hardwareAbstractionCollection;
#if defined(HARDWARE_ABSTRACTION_COLLECTION_ID)
		hardwareAbstractionCollection = (HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID);
#endif
		
		IBooleanOutputService **injectorServices;
#ifdef INJECTOR_SERVICES_ID
		injectorServices = (IBooleanOutputService**)serviceLocator->Locate(INJECTOR_SERVICES_ID);
#endif
		
		unsigned char primeServiceId = *((unsigned char*)config);
		*totalSize = 1;
		switch (primeServiceId)
		{
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 1:
			{
				PrimeService_StaticPulseWidthConfig *primeConfig = PrimeService_StaticPulseWidthConfig::Cast((unsigned char*)config + 1);
				*totalSize = primeConfig->Size() + 1;
				
				if (hardwareAbstractionCollection == 0 || injectorServices == 0)
					return 0;
				
				return new PrimeService_StaticPulseWidth(primeConfig, hardwareAbstractionCollection->TimerService, injectorServices);
			}
#endif
		}
		return 0;
	}
	
	IIdleControlService* ServiceBuilder::CreateIdleControlService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		HardwareAbstractionCollection *hardwareAbstractionCollection = 0;
#ifdef HARDWARE_ABSTRACTION_COLLECTION_ID
		hardwareAbstractionCollection = (HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID);
#endif
		
		IFloatOutputService *idleAirControlValveService = 0;
#if defined(IDLE_AIR_CONTROL_VALVE_SERVICE_ID)
		idleAirControlValveService = (IFloatOutputService*)serviceLocator->Locate(IDLE_AIR_CONTROL_VALVE_SERVICE_ID);
#endif
		
		IDecoder *decoder = 0;
#ifdef DECODER_SERVICE_ID
		decoder = (IDecoder *)serviceLocator->Locate(DECODER_SERVICE_ID);
#endif
		
		IFloatInputService *engineCoolantTemperatureService = 0;
#ifdef ENGINE_COOLANT_TEMPERATURE_SERVICE_ID
		engineCoolantTemperatureService = (IFloatInputService*)serviceLocator->Locate(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID);
#endif
		
		IFloatInputService *throttlePositionService = 0;
#ifdef THROTTLE_POSITION_SERVICE_ID
		throttlePositionService = (IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID);
#endif  		
		
		IFloatInputService *vehicleSpeedService = 0;
#ifdef VEHICLE_SPEED_SERVICE_ID
		vehicleSpeedService = (IFloatInputService*)serviceLocator->Locate(VEHICLE_SPEED_SERVICE_ID);
#endif  
		
		IFloatInputService *intakeAirTemperatureService = 0;
#ifdef INTAKE_AIR_TEMPERATURE_SERVICE_ID
		intakeAirTemperatureService = (IFloatInputService*)serviceLocator->Locate(INTAKE_AIR_TEMPERATURE_SERVICE_ID);
#endif  
		
		IFloatInputService *manifoldAbsolutePressureService = 0;
#ifdef MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID
		manifoldAbsolutePressureService = (IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID);
#endif  
		
		unsigned char primeServiceId = *((unsigned char*)config);
		*totalSize = 1;
		switch (primeServiceId)
		{
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 1:
			{
				IdleControlService_PidConfig *idleConfig = IdleControlService_PidConfig::Cast((unsigned char*)config + 1);
				*totalSize = idleConfig->Size() + 1;
				
				if (engineCoolantTemperatureService == 0 || idleAirControlValveService == 0 || decoder == 0 || idleAirControlValveService == 0 || hardwareAbstractionCollection == 0)
					return 0;
				
				return new IdleControlService_Pid(
					idleConfig, 
					hardwareAbstractionCollection, 
					decoder, 
					throttlePositionService, 
					engineCoolantTemperatureService, 
					vehicleSpeedService,
					intakeAirTemperatureService, 
					manifoldAbsolutePressureService,
					idleAirControlValveService);
			}
#endif
		}
		return 0;
	}
	
	IAfrService *ServiceBuilder::CreateAfrService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		HardwareAbstractionCollection *hardwareAbstractionCollection = 0;
#ifdef HARDWARE_ABSTRACTION_COLLECTION_ID
		hardwareAbstractionCollection = (HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID);
#endif
		
		IFloatOutputService *idleAirControlValveService = 0;
#if defined(IDLE_AIR_CONTROL_VALVE_SERVICE_ID)
		idleAirControlValveService = (IFloatOutputService*)serviceLocator->Locate(IDLE_AIR_CONTROL_VALVE_SERVICE_ID);
#endif
		
		IDecoder *decoder = 0;
#ifdef DECODER_SERVICE_ID
		decoder = (IDecoder *)serviceLocator->Locate(DECODER_SERVICE_ID);
#endif
		
		IFloatInputService *engineCoolantTemperatureService = 0;
#ifdef ENGINE_COOLANT_TEMPERATURE_SERVICE_ID
		engineCoolantTemperatureService = (IFloatInputService*)serviceLocator->Locate(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID);
#endif
		
		IFloatInputService *throttlePositionService = 0;
#ifdef THROTTLE_POSITION_SERVICE_ID
		throttlePositionService = (IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID);
#endif  		
		
		IFloatInputService *vehicleSpeedService = 0;
#ifdef VEHICLE_SPEED_SERVICE_ID
		vehicleSpeedService = (IFloatInputService*)serviceLocator->Locate(VEHICLE_SPEED_SERVICE_ID);
#endif  
		
		IFloatInputService *intakeAirTemperatureService = 0;
#ifdef INTAKE_AIR_TEMPERATURE_SERVICE_ID
		intakeAirTemperatureService = (IFloatInputService*)serviceLocator->Locate(INTAKE_AIR_TEMPERATURE_SERVICE_ID);
#endif  
		
		IFloatInputService *manifoldAbsolutePressureService = 0;
#ifdef MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID
		manifoldAbsolutePressureService = (IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID);
#endif  
		
		IFloatInputService *ethanolContentService = 0;
#ifdef ETHANOL_CONTENT_SERVICE_ID
		ethanolContentService = (IFloatInputService*)serviceLocator->Locate(ETHANOL_CONTENT_SERVICE_ID);
#endif  
		
		unsigned char afrServiceId = *((unsigned char*)config);
		*totalSize = 1;
		switch (afrServiceId)
		{
			return 0;
#ifdef AFRSERVICE_STATIC_H
		case 1:
			*totalSize = 2;
			return new AfrService_Static(*((float*)((unsigned char*)config + 1)));
#endif
#ifdef AFRSERVICE_MAP_ETHANOL_H
		case 2:
			{
				AfrService_Map_EthanolConfig *afrConfig = AfrService_Map_EthanolConfig::Cast((unsigned char*)config + 1);
				*totalSize = afrConfig->Size() + 1;
				
				if (hardwareAbstractionCollection->TimerService == 0 || manifoldAbsolutePressureService == 0 || throttlePositionService == 0)
					return 0;
				
				return new AfrService_Map_Ethanol(afrConfig, hardwareAbstractionCollection->TimerService, decoder, manifoldAbsolutePressureService, engineCoolantTemperatureService, ethanolContentService, throttlePositionService);
			}
#endif
		}
	}
	
	IFuelTrimService *ServiceBuilder::CreateFuelTrimService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		HardwareAbstractionCollection *hardwareAbstractionCollection = 0;
#ifdef HARDWARE_ABSTRACTION_COLLECTION_ID
		hardwareAbstractionCollection = (HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID);
#endif
		
		IFloatOutputService *idleAirControlValveService = 0;
#if defined(IDLE_AIR_CONTROL_VALVE_SERVICE_ID)
		idleAirControlValveService = (IFloatOutputService*)serviceLocator->Locate(IDLE_AIR_CONTROL_VALVE_SERVICE_ID);
#endif
		
		IDecoder *decoder = 0;
#ifdef DECODER_SERVICE_ID
		decoder = (IDecoder *)serviceLocator->Locate(DECODER_SERVICE_ID);
#endif
		
		IFloatInputService *throttlePositionService = 0;
#ifdef THROTTLE_POSITION_SERVICE_ID
		throttlePositionService = (IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID);
#endif 
		
		IFloatInputService *manifoldAbsolutePressureService = 0;
#ifdef MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID
		manifoldAbsolutePressureService = (IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID);
#endif  
		
		IAfrService *afrService = 0;
#ifdef AFR_SERVICE_ID
		afrService = (IAfrService*)serviceLocator->Locate(AFR_SERVICE_ID);
#endif
		
		unsigned char fuelTrimId = *((unsigned char*)config);
		*totalSize = 1;
		switch (fuelTrimId)
		{
		case 0:
			return 0;
#ifdef FUELTRIMSERVICE_INTERPOLATEDTABLE_H
		case 1:
			{
				FuelTrimService_InterpolatedTableConfig *fuelTrimConfig = FuelTrimService_InterpolatedTableConfig::Cast((unsigned char*)config + 1);
				*totalSize = fuelTrimConfig->Size() + 1;
				
				unsigned int size;
				IFloatInputService *lambdaService = IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				if (lambdaService == 0)
					return 0;
				
				if (hardwareAbstractionCollection == 0 || decoder == 0 || (throttlePositionService == 0 && manifoldAbsolutePressureService == 0) || afrService == 0)
				{
					delete lambdaService;
					return 0;
				}
				
				return new FuelTrimService_InterpolatedTable(fuelTrimConfig, hardwareAbstractionCollection->TimerService, decoder, throttlePositionService, manifoldAbsolutePressureService, lambdaService, afrService);
			}
#endif
#ifdef FUELTRIMSERVICEWRAPPER_MULTICHANNEL_H
		case 2:
			{
				FuelTrimServiceWrapper_MultiChannelConfig *fuelTrimConfig = FuelTrimServiceWrapper_MultiChannelConfig::Cast((unsigned char*)config + 1);
				*totalSize = fuelTrimConfig->Size() + 1;
				
				IFuelTrimService *fuelTrimServices[fuelTrimConfig->NumberOfFuelTrimChannels];
				
				for (int i = 0; i < fuelTrimConfig->NumberOfFuelTrimChannels; i++)
				{
					unsigned int size;
					fuelTrimServices[i] = CreateFuelTrimService(serviceLocator, config, &size);
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
				}
			
				return new FuelTrimServiceWrapper_MultiChannel(fuelTrimConfig, fuelTrimServices);
			}
#endif
		}
	}
}