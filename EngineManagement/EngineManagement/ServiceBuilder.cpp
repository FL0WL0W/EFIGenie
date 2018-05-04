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
#ifdef FUEL_PUMP_SERVICE_ID
			case FUEL_PUMP_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateFuelPumpService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#ifdef PISTON_ENGINE_SERVICE_ID
			case PISTON_ENGINE_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreatePistonEngineService(serviceLocator, config, &size));
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
		*totalSize = 0;
		TachometerServiceConfig *tachometerConfig = CastConfig < TachometerServiceConfig>(&config, totalSize);
		
		//TODO put this in a helper function
		unsigned int size;
		IBooleanOutputService *booleanOutputService = IBooleanOutputService::CreateBooleanOutputService(
			LocateRequired<HardwareAbstractionCollection *>(serviceLocator, HARDWARE_ABSTRACTION_COLLECTION_ID), 
			config, 
			&size, 
			BOOLEAN_OUTPUT_SERVICE_HIGHZ);
		config = (void *)((unsigned char *)config + size);
		*totalSize += size;
				
		return new TachometerService(tachometerConfig,
			booleanOutputService,
			LocateRequired<ITimerService *>(serviceLocator, TIMER_SERVICE_ID),
			LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID));
	}
	
	IPrimeService* ServiceBuilder::CreatePrimeService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		switch (GetServiceId(&config, totalSize))
		{
		case 0:
			return 0;
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 1:
			return new PrimeService_StaticPulseWidth(
				CastConfig < PrimeService_StaticPulseWidthConfig>(&config, totalSize), 
				LocateRequired<ITimerService *>(serviceLocator, TIMER_SERVICE_ID), 
				LocateRequired<IBooleanOutputService **>(serviceLocator, INJECTOR_SERVICES_ID));
#endif
		}
		return 0;
	}
	
	IIdleControlService* ServiceBuilder::CreateIdleControlService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		switch (GetServiceId(&config, totalSize))
		{
		case 0:
			return 0;
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 1:
			{				
				return new IdleControlService_Pid(
					CastConfig < IdleControlService_PidConfig >(&config, totalSize),  
					LocateRequired<HardwareAbstractionCollection *>(serviceLocator, HARDWARE_ABSTRACTION_COLLECTION_ID), 
					LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID), 
					LocateOptional<IFloatInputService *>(serviceLocator, THROTTLE_POSITION_SERVICE_ID), 
					LocateRequired<IFloatInputService *>(serviceLocator, ENGINE_COOLANT_TEMPERATURE_SERVICE_ID), 
					LocateOptional<IFloatInputService *>(serviceLocator, VEHICLE_SPEED_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, INTAKE_AIR_TEMPERATURE_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
					LocateRequired<IFloatOutputService *>(serviceLocator, IDLE_AIR_CONTROL_VALVE_SERVICE_ID));
			}
#endif
		}
		return 0;
	}
	
	IAfrService *ServiceBuilder::CreateAfrService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{		
		switch (GetServiceId(&config, totalSize))
		{
		case 0:
			return 0;
#ifdef AFRSERVICE_STATIC_H
		case 1:
			*totalSize += 1;
			return new AfrService_Static(*((float*)((unsigned char*)config)));
#endif
#ifdef AFRSERVICE_MAP_ETHANOL_H
		case 2:
			{
				return new AfrService_Map_Ethanol(
					CastConfig < AfrService_Map_EthanolConfig >(&config, totalSize),  
					LocateRequired<ITimerService *>(serviceLocator, TIMER_SERVICE_ID),
					LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID),
					LocateRequired<IFloatInputService *>(serviceLocator, MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, ETHANOL_CONTENT_SERVICE_ID),
					LocateRequired<IFloatInputService *>(serviceLocator, THROTTLE_POSITION_SERVICE_ID));
			}
#endif
		}
		return 0;
	}
	
	IFuelTrimService *ServiceBuilder::CreateFuelTrimService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{		
		switch (GetServiceId(&config, totalSize))
		{
		case 0:
			return 0;
#ifdef FUELTRIMSERVICE_INTERPOLATEDTABLE_H
		case 1:
			{
				FuelTrimService_InterpolatedTableConfig *fuelTrimConfig = CastConfig < FuelTrimService_InterpolatedTableConfig >(&config, totalSize);
				
				unsigned int size;
				IFloatInputService *lambdaService = IFloatInputService::CreateFloatInputService(LocateRequired<HardwareAbstractionCollection *>(serviceLocator, HARDWARE_ABSTRACTION_COLLECTION_ID), config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				return new FuelTrimService_InterpolatedTable(
					fuelTrimConfig, 
					LocateRequired<ITimerService *>(serviceLocator, TIMER_SERVICE_ID), 
					LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, THROTTLE_POSITION_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
					lambdaService,
					LocateRequired<IAfrService *>(serviceLocator, AFR_SERVICE_ID));
			}
#endif
#ifdef FUELTRIMSERVICEWRAPPER_MULTICHANNEL_H
		case 2:
			{
				FuelTrimServiceWrapper_MultiChannelConfig *fuelTrimConfig = CastConfig < FuelTrimServiceWrapper_MultiChannelConfig >(&config, totalSize);
				
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
		return 0;
	}
	
	IFuelPumpService *ServiceBuilder::CreateFuelPumpService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{		
		switch (GetServiceId(&config, totalSize))
		{
		case 0:
			return 0;
#ifdef FUELPUMPSERVICE_H
		case 1:
			{
				FuelPumpServiceConfig *fuelPumpConfig =  CastConfig < FuelPumpServiceConfig >(&config, totalSize);
		
				unsigned int size;
				IBooleanOutputService *booleanOutputService = IBooleanOutputService::CreateBooleanOutputService(LocateRequired<HardwareAbstractionCollection *>(serviceLocator, HARDWARE_ABSTRACTION_COLLECTION_ID), config, &size, BOOLEAN_OUTPUT_SERVICE_HIGHZ);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				return new FuelPumpService(fuelPumpConfig, LocateRequired<ITimerService *>(serviceLocator, TIMER_SERVICE_ID), booleanOutputService);
			}
#endif
#ifdef FUELPUMPSERVICE_ANALOG_H
		case 2:
			{
				FuelPumpService_AnalogConfig *fuelPumpConfig =  CastConfig < FuelPumpService_AnalogConfig >(&config, totalSize);
		
				unsigned int size;
				IFloatOutputService *floatOutputService = IFloatOutputService::CreateFloatOutputService(LocateRequired<HardwareAbstractionCollection *>(serviceLocator, HARDWARE_ABSTRACTION_COLLECTION_ID), config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
						
				return new FuelPumpService_Analog(
					fuelPumpConfig, 
					LocateRequired<ITimerService *>(serviceLocator, TIMER_SERVICE_ID), floatOutputService, 
					LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, THROTTLE_POSITION_SERVICE_ID));
			}
#endif
		}
		return 0;
	}
	
	IPistonEngineInjectionConfig *ServiceBuilder::CreatePistonEngineInjetionConfig(ServiceLocator *serviceLocator, PistonEngineConfig *pistonEngineConfig, void *config, unsigned int *totalSize)
	{		
		switch (GetServiceId(&config, totalSize))
		{
		case 0: 
			return 0;
#ifdef PISTONENGINEINJECTIONCONFIG_SD_H
		case 1:
			{
				return new PistonEngineInjectionConfig_SD(
					CastConfig < PistonEngineInjectionConfig_SDConfig >(&config, totalSize),
					pistonEngineConfig,
					LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID),
					LocateRequired<IFloatInputService *>(serviceLocator, MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
					LocateRequired<IAfrService *>(serviceLocator, AFR_SERVICE_ID),
					LocateOptional<IFuelTrimService *>(serviceLocator, FUEL_TRIM_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, INTAKE_AIR_TEMPERATURE_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, THROTTLE_POSITION_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, VOLTAGE_SERVICE_ID));
			}
#endif
#ifdef PISTONENGINEINJECTIONCONFIGWRAPPER_DFCO_H
		case 2:
			{
				PistonEngineInjectionConfigWrapper_DFCOConfig *pistonEngineInjectionConfig = CastConfig < PistonEngineInjectionConfigWrapper_DFCOConfig >(&config, totalSize);

				unsigned int size;
				IPistonEngineInjectionConfig *child = CreatePistonEngineInjetionConfig(serviceLocator, pistonEngineConfig, config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;

				return new PistonEngineInjectionConfigWrapper_DFCO(pistonEngineInjectionConfig, 
					LocateRequired<IFloatInputService *>(serviceLocator, THROTTLE_POSITION_SERVICE_ID),
					LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID),
					child);
			}
#endif
		}
		return 0;
	}
	
	IPistonEngineIgnitionConfig *ServiceBuilder::CreatePistonEngineIgnitionConfig(ServiceLocator *serviceLocator, PistonEngineConfig *pistonEngineConfig, void *config, unsigned int *totalSize)
	{				
		switch (GetServiceId(&config, totalSize))
		{
		case 0: 
			return 0;
#ifdef PISTONENGINEIGNITIONCONFIG_MAP_ETHANOL_H
		case 1:
				return new PistonEngineIgnitionConfig_Map_Ethanol(
					CastConfig < PistonEngineIgnitionConfig_Map_EthanolConfig >(&config, totalSize),
					LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID),
					LocateOptional<IFloatInputService *>(serviceLocator, ETHANOL_CONTENT_SERVICE_ID),
					LocateRequired<IFloatInputService *>(serviceLocator, MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID));
#endif
#ifdef PISTONENGINEIGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H
		case 2:
			{
				PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig *pistonEngineIgnitionConfig = CastConfig < PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig >(&config, totalSize);

				unsigned int size;
				IBooleanInputService *booleanInputService = IBooleanInputService::CreateBooleanInputService(LocateRequired<HardwareAbstractionCollection *>(serviceLocator, HARDWARE_ABSTRACTION_COLLECTION_ID), config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				IPistonEngineIgnitionConfig *child = CreatePistonEngineIgnitionConfig(serviceLocator, pistonEngineConfig, config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				return new PistonEngineIgnitionConfigWrapper_HardRpmLimit(
					pistonEngineIgnitionConfig,  
					LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID),
					booleanInputService,
					child);
			}
#endif
#ifdef PISTONENGINEIGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H
		case 3:
			{
				PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig *pistonEngineIgnitionConfig = CastConfig < PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig >(&config, totalSize);

				unsigned int size;
				IBooleanInputService *booleanInputService = IBooleanInputService::CreateBooleanInputService(LocateRequired<HardwareAbstractionCollection *>(serviceLocator, HARDWARE_ABSTRACTION_COLLECTION_ID), config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				IPistonEngineIgnitionConfig *child = CreatePistonEngineIgnitionConfig(serviceLocator, pistonEngineConfig, config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				return new PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit(
					pistonEngineIgnitionConfig,
					LocateRequired<ITimerService *>(serviceLocator, TIMER_SERVICE_ID), 
					LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID),
					booleanInputService,
					child);
			}
#endif
		}
		return 0;
	}
	
	PistonEngineService *ServiceBuilder::CreatePistonEngineService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{				
		PistonEngineConfig *engineConfig = CastConfig < PistonEngineConfig >(&config, totalSize);
		
		IPistonEngineInjectionConfig *injectionConfig = 0;
		unsigned int size;
#ifndef NOINJECTION
		injectionConfig = CreatePistonEngineInjetionConfig(serviceLocator, engineConfig, config, &size);
		config = (void *)((unsigned char *)config + size);
		*totalSize += size;
#endif
		
		IPistonEngineIgnitionConfig *ignitionConfig = 0;
#ifndef NOIGNITION
		ignitionConfig = CreatePistonEngineIgnitionConfig(serviceLocator, engineConfig, config, &size);
		config = (void *)((unsigned char *)config + size);
		*totalSize += size;
#endif
		
		return new PistonEngineService(
			engineConfig, 
			injectionConfig,
			LocateOptional<IBooleanOutputService **>(serviceLocator, INJECTOR_SERVICES_ID),
			ignitionConfig,
			LocateOptional<IBooleanOutputService **>(serviceLocator, IGNITOR_SERVICES_ID),
			LocateRequired<ITimerService *>(serviceLocator, TIMER_SERVICE_ID),
			LocateRequired<IDecoder *>(serviceLocator, DECODER_SERVICE_ID));
	}
}