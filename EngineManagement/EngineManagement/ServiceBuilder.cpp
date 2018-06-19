#include "stdlib.h"
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
#if INTAKE_AIR_TEMPERATURE_SERVICE_ID
			case INTAKE_AIR_TEMPERATURE_SERVICE_ID:
#endif
#if ENGINE_COOLANT_TEMPERATURE_SERVICE_ID
			case ENGINE_COOLANT_TEMPERATURE_SERVICE_ID:
#endif
#if MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID
			case MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID:
#endif
#if VOLTAGE_SERVICE_ID
			case VOLTAGE_SERVICE_ID:
#endif
#if THROTTLE_POSITION_SERVICE_ID
			case THROTTLE_POSITION_SERVICE_ID:
#endif
#if ETHANOL_CONTENT_SERVICE_ID
			case ETHANOL_CONTENT_SERVICE_ID:
#endif
#if VEHICLE_SPEED_SERVICE_ID
			case VEHICLE_SPEED_SERVICE_ID:
#endif
				{
					serviceLocator->Register(serviceId, IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#if IGNITOR_SERVICES_ID
			case IGNITOR_SERVICES_ID:
#endif
#if INJECTOR_SERVICES_ID
			case INJECTOR_SERVICES_ID:
#endif
				{
					unsigned char numberOfServices = *(unsigned char *)config;
					config = (void *)((unsigned char *)config + 1);
					*totalSize++;

					IBooleanOutputService **serviceArray = (IBooleanOutputService **)malloc(sizeof(IBooleanOutputService *)*(numberOfServices + 1));
					for (int i = 0; i < numberOfServices; i++)
					{
						serviceArray[i] = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &size);
						config = (void *)((unsigned char *)config + size);
						*totalSize += size;
					}
					serviceArray[numberOfServices] = 0;
					serviceLocator->Register(serviceId, serviceArray);
					break;
				}
#if TACHOMETER_SERVICE_ID
			case TACHOMETER_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateTachometerService(serviceLocator, config, &size)); //needs BooleanOutputService, TimerService and Decoder
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#if IDLE_AIR_CONTROL_VALVE_SERVICE_ID
			case IDLE_AIR_CONTROL_VALVE_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#if PRIME_SERVICE_ID
			case PRIME_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreatePrimeService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#if IDLE_CONTROL_SERVICE_ID
			case IDLE_CONTROL_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateIdleControlService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#if AFR_SERVICE_ID
			case AFR_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateAfrService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#if FUEL_TRIM_SERVICE_ID
			case FUEL_TRIM_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateFuelTrimService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#if FUEL_PUMP_SERVICE_ID
			case FUEL_PUMP_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateFuelPumpService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
#if IGNITION_SCHEDULING_SERVICE_ID
			case IGNITION_SCHEDULING_SERVICE_ID:
			{
				serviceLocator->Register(serviceId, CreateIgnitionSchedulingService(serviceLocator, config, &size));
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				break;
			}
#endif
#if INJECTION_SCHEDULING_SERVICE_ID
			case INJECTION_SCHEDULING_SERVICE_ID:
			{
				serviceLocator->Register(serviceId, CreateInjectionSchedulingService(serviceLocator, config, &size));
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				break;
			}
#endif
#if DECODER_SERVICE_ID
			case DECODER_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateDecoderService(serviceLocator, config, &size));
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
				
		return new TachometerService(
			CastConfig < TachometerServiceConfig>(&config, totalSize),
			CreateBooleanOutputService(serviceLocator, &config, totalSize),
			(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID),
			(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID));
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
				(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID), 
				(IBooleanOutputService**)serviceLocator->Locate(INJECTOR_SERVICES_ID));
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
			return new IdleControlService_Pid(
				CastConfig < IdleControlService_PidConfig >(&config, totalSize),  
				(HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID), 
				(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID), 
				(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID), 
				(IFloatInputService*)serviceLocator->Locate(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID), 
				(IFloatInputService*)serviceLocator->Locate(VEHICLE_SPEED_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(INTAKE_AIR_TEMPERATURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				(IFloatOutputService*)serviceLocator->Locate(IDLE_AIR_CONTROL_VALVE_SERVICE_ID));
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
			return new AfrService_Map_Ethanol(
				CastConfig < AfrService_Map_EthanolConfig >(&config, totalSize),  
				(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID),
				(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(ETHANOL_CONTENT_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID));
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
			return new FuelTrimService_InterpolatedTable(
				CastConfig < FuelTrimService_InterpolatedTableConfig >(&config, totalSize), 
				(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID), 
				(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				CreateFloatInputService(serviceLocator, &config, totalSize),
				(IAfrService*)serviceLocator->Locate(AFR_SERVICE_ID));
#endif
#ifdef FUELTRIMSERVICEWRAPPER_MULTICHANNEL_H
		case 2:
			{
				FuelTrimServiceWrapper_MultiChannelConfig *fuelTrimConfig = CastConfig < FuelTrimServiceWrapper_MultiChannelConfig >(&config, totalSize);
				
				IFuelTrimService **fuelTrimServices = (IFuelTrimService **)malloc(sizeof(IFuelTrimService *)*(fuelTrimConfig->NumberOfFuelTrimChannels));
				
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
			FuelPumpServiceConfig *serviceConfig = CastConfig < FuelPumpServiceConfig >(&config, totalSize);

			return new FuelPumpService(
				serviceConfig,
				(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID),
				CreateBooleanOutputService(serviceLocator, &config, totalSize));
		}
#endif
#ifdef FUELPUMPSERVICE_ANALOG_H
		case 2:						
			return new FuelPumpService_Analog(
				CastConfig < FuelPumpService_AnalogConfig >(&config, totalSize), 
				(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID), 
				CreateFloatOutputService(serviceLocator, &config, totalSize), 
				(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID));
#endif
		}
		return 0;
	}
	
	IPistonEngineInjectionConfig *ServiceBuilder::CreatePistonEngineInjetionConfig(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{		
		switch (GetServiceId(&config, totalSize))
		{
		case 0: 
			return 0;
#ifdef PISTONENGINEINJECTIONCONFIG_SD_H
		case 2:
			return new PistonEngineInjectionConfig_SD(
				CastConfig < PistonEngineInjectionConfig_SDConfig >(&config, totalSize),
				(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				(IAfrService*)serviceLocator->Locate(AFR_SERVICE_ID),
				(IFuelTrimService*)serviceLocator->Locate(FUEL_TRIM_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(INTAKE_AIR_TEMPERATURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(VOLTAGE_SERVICE_ID));
#endif
#ifdef PISTONENGINEINJECTIONCONFIGWRAPPER_DFCO_H
		case 3:
			{
				PistonEngineInjectionConfigWrapper_DFCOConfig *pistonEngineInjectionConfig = CastConfig < PistonEngineInjectionConfigWrapper_DFCOConfig >(&config, totalSize);

				unsigned int size;
				IPistonEngineInjectionConfig *child = CreatePistonEngineInjetionConfig(serviceLocator, config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;

				return new PistonEngineInjectionConfigWrapper_DFCO(pistonEngineInjectionConfig, 
					(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID),
					(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
					child);
			}
#endif
		}
		return 0;
	}
	
	IPistonEngineIgnitionConfig *ServiceBuilder::CreatePistonEngineIgnitionConfig(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{				
		switch (GetServiceId(&config, totalSize))
		{
		case 0: 
			return 0;
#ifdef PISTONENGINEIGNITIONCONFIG_STATIC_H
		case 1:
			return new PistonEngineIgnitionConfig_Static(
				CastConfig < PistonEngineIgnitionConfig_StaticConfig >(&config, totalSize));
#endif
#ifdef PISTONENGINEIGNITIONCONFIG_MAP_ETHANOL_H
		case 2:
			return new PistonEngineIgnitionConfig_Map_Ethanol(
				CastConfig < PistonEngineIgnitionConfig_Map_EthanolConfig >(&config, totalSize),
				(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(ETHANOL_CONTENT_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID));
#endif
#ifdef PISTONENGINEIGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H
		case 3:
			{
				PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig *pistonEngineIgnitionConfig = CastConfig < PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig >(&config, totalSize);

				IBooleanInputService *booleanInputService = CreateBooleanInputService(serviceLocator, &config, totalSize);
				
				unsigned int size;
				IPistonEngineIgnitionConfig *child = CreatePistonEngineIgnitionConfig(serviceLocator, config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				return new PistonEngineIgnitionConfigWrapper_HardRpmLimit(
					pistonEngineIgnitionConfig,  
					(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
					booleanInputService,
					child);
			}
#endif
#ifdef PISTONENGINEIGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H
		case 4:
			{
				PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig *pistonEngineIgnitionConfig = CastConfig < PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig >(&config, totalSize);

				IBooleanInputService *booleanInputService = CreateBooleanInputService(serviceLocator, &config, totalSize);
				
				unsigned int size;
				IPistonEngineIgnitionConfig *child = CreatePistonEngineIgnitionConfig(serviceLocator, config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				return new PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit(
					pistonEngineIgnitionConfig,
					(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID), 
					(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
					booleanInputService,
					child);
			}
#endif
		}
		return 0;
	}

	IgnitionSchedulingService *ServiceBuilder::CreateIgnitionSchedulingService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		IgnitionSchedulingServiceConfig *ignitionSchedulingConfig = CastConfig < IgnitionSchedulingServiceConfig >(&config, totalSize);
		
		IPistonEngineIgnitionConfig *ignitionConfig = 0;
		unsigned int size;
		ignitionConfig = CreatePistonEngineIgnitionConfig(serviceLocator, config, &size);
		config = (void *)((unsigned char *)config + size);
		*totalSize += size;

		return new IgnitionSchedulingService(
			ignitionSchedulingConfig,
			ignitionConfig,
			(IBooleanOutputService**)serviceLocator->Locate(IGNITOR_SERVICES_ID),
			(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID),
			(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID));
	}

	InjectionSchedulingService *ServiceBuilder::CreateInjectionSchedulingService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		InjectionSchedulingServiceConfig *injectionSchedulingConfig = CastConfig < InjectionSchedulingServiceConfig >(&config, totalSize);

		IPistonEngineInjectionConfig *injectionConfig = 0;
		unsigned int size;
		injectionConfig = CreatePistonEngineInjetionConfig(serviceLocator, config, &size);
		config = (void *)((unsigned char *)config + size);
		*totalSize += size;
		
		return new InjectionSchedulingService(
			injectionSchedulingConfig,
			injectionConfig,
			(IBooleanOutputService**)serviceLocator->Locate(INJECTOR_SERVICES_ID),
			(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID),
			(IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID));
	}
	
	IDecoder *ServiceBuilder::CreateDecoderService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		switch (GetServiceId(&config, totalSize))
		{
		case 0:
			return 0;
#ifdef GM24XDECODER_H
		case 1:
			return new Gm24xDecoder((ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID));
#endif
		}
		return 0;
	}
}