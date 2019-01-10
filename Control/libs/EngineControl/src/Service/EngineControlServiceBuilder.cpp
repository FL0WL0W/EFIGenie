#include "stdlib.h"
#include "Service/EngineControlServiceBuilder.h"

namespace Service
{
	ServiceLocator *EngineControlServiceBuilder::CreateServices(ServiceLocator *serviceLocator, const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *totalSize)
	{
		if(serviceLocator == 0)
			serviceLocator = new ServiceLocator();
		
		if(serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID) == 0)
			serviceLocator->Register(HARDWARE_ABSTRACTION_COLLECTION_ID, (void *)hardwareAbstractionCollection);
		if(serviceLocator->Locate(ANALOG_SERVICE_ID) == 0)
			serviceLocator->Register(ANALOG_SERVICE_ID, (void *)hardwareAbstractionCollection->AnalogService);
		if(serviceLocator->Locate(DIGITAL_SERVICE_ID) == 0)
			serviceLocator->Register(DIGITAL_SERVICE_ID, (void *)hardwareAbstractionCollection->DigitalService);
		if(serviceLocator->Locate(PWM_SERVICE_ID) == 0)
			serviceLocator->Register(PWM_SERVICE_ID, (void *)hardwareAbstractionCollection->PwmService);
		if(serviceLocator->Locate(TIMER_SERVICE_ID) == 0)
			serviceLocator->Register(TIMER_SERVICE_ID, (void *)hardwareAbstractionCollection->TimerService);
		
		//create callback groups
		if(serviceLocator->Locate(PRE_DECODER_SYNC_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(PRE_DECODER_SYNC_CALL_BACK_GROUP, (void *)new CallBackGroup());
		if(serviceLocator->Locate(POST_DECODER_SYNC_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(POST_DECODER_SYNC_CALL_BACK_GROUP, (void *)new CallBackGroup());
		if(serviceLocator->Locate(TICK_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)new CallBackGroup());

		CallBackGroup *preDecoderCallBackGroup = (CallBackGroup *)serviceLocator->Locate(PRE_DECODER_SYNC_CALL_BACK_GROUP);
		CallBackGroup *postDecoderCallBackGroup = (CallBackGroup *)serviceLocator->Locate(POST_DECODER_SYNC_CALL_BACK_GROUP);
		CallBackGroup *tickCallBackGroup = (CallBackGroup *)serviceLocator->Locate(TICK_CALL_BACK_GROUP);

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
					IFloatInputService *floatInputService = IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size);
					tickCallBackGroup->Add(IFloatInputService::ReadValueCallBack, floatInputService);
					serviceLocator->Register(serviceId, floatInputService);
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
					serviceLocator->Register(serviceId, IFloatOutputService::CreateFloatOutputService(hardwareAbstractionCollection, config, &size));
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
	
	TachometerService *EngineControlServiceBuilder::CreateTachometerService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{		
		*totalSize = 0;
				
		return new TachometerService(
			CastConfig < TachometerServiceConfig>(&config, totalSize),
			CreateBooleanOutputService(serviceLocator, &config, totalSize),
			(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID),
			(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID));
	}
	
	IPrimeService* EngineControlServiceBuilder::CreatePrimeService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		IPrimeService* ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 1:
			ret = new PrimeService_StaticPulseWidth(
				CastConfig < PrimeService_StaticPulseWidthConfig>(&config, totalSize), 
				(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID), 
				(IBooleanOutputService**)serviceLocator->Locate(INJECTOR_SERVICES_ID));
			break;
#endif
		}
		
		if (ret != 0)
		{
			CallBackGroup *postSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(POST_DECODER_SYNC_CALL_BACK_GROUP);
			CallBackGroup *tickSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(TICK_CALL_BACK_GROUP);
			
			postSyncCallBackGroup->Add(IPrimeService::PrimeCallBack, ret);
			tickSyncCallBackGroup->Add(IPrimeService::TickCallBack, ret);
		}
		
		return ret;
	}
	
	IIdleControlService* EngineControlServiceBuilder::CreateIdleControlService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		IIdleControlService*ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 1:	
			ret = new IdleControlService_Pid(
				CastConfig < IdleControlService_PidConfig >(&config, totalSize),  
				(HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID), 
				(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID), 
				(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID), 
				(IFloatInputService*)serviceLocator->Locate(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID), 
				(IFloatInputService*)serviceLocator->Locate(VEHICLE_SPEED_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(INTAKE_AIR_TEMPERATURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				(IFloatOutputService*)serviceLocator->Locate(IDLE_AIR_CONTROL_VALVE_SERVICE_ID));
			break;
#endif
		}
		
		if (ret != 0)
		{
			CallBackGroup *tickSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(TICK_CALL_BACK_GROUP);
			
			tickSyncCallBackGroup->Add(IIdleControlService::TickCallBack, ret);
		}
		
		return ret;
	}
	
	IAfrService *EngineControlServiceBuilder::CreateAfrService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{		
		IAfrService *ret = 0;
		switch (GetServiceId(&config, totalSize))
		{
#ifdef AFRSERVICE_STATIC_H
		case 1:
			*totalSize += 1;
			ret = new AfrService_Static(*((float *)config));
			break;
#endif
#ifdef AFRSERVICE_MAP_ETHANOL_H
		case 2:
			ret = new AfrService_Map_Ethanol(
				CastConfig < AfrService_Map_EthanolConfig >(&config, totalSize),  
				(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID),
				(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(ETHANOL_CONTENT_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID));
			break;
#endif
		}
		
		if (ret != 0)
		{
			CallBackGroup *tickSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(TICK_CALL_BACK_GROUP);
			
			tickSyncCallBackGroup->Add(IAfrService::CalculateAfrCallBack, ret);
		}
		
		return ret;
	}
	
	IFuelTrimService *EngineControlServiceBuilder::CreateFuelTrimService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		IFuelTrimService *ret = 0;
		switch (GetServiceId(&config, totalSize))
		{
#ifdef FUELTRIMSERVICE_INTERPOLATEDTABLE_H
		case 1:
			{
				FuelTrimService_InterpolatedTableConfig *serviceConfig = CastConfig < FuelTrimService_InterpolatedTableConfig >(&config, totalSize);
				
				ret = new FuelTrimService_InterpolatedTable(
					serviceConfig, 
					(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID), 
					(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
					(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID),
					(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
					CreateFloatInputService(serviceLocator, &config, totalSize),
					(IAfrService*)serviceLocator->Locate(AFR_SERVICE_ID));
				break;
			}
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
			
				ret = new FuelTrimServiceWrapper_MultiChannel(fuelTrimConfig, fuelTrimServices);
				break;
			}
#endif
		}
		
		if (ret != 0)
		{
			CallBackGroup *tickSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(TICK_CALL_BACK_GROUP);
			
			tickSyncCallBackGroup->Add(IFuelTrimService::TickCallBack, ret);
		}
		
		return ret;
	}
	
	IFuelPumpService *EngineControlServiceBuilder::CreateFuelPumpService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		IFuelPumpService *ret = 0;
		switch (GetServiceId(&config, totalSize))
		{
#ifdef FUELPUMPSERVICE_H
		case 1:
			{
				FuelPumpServiceConfig *serviceConfig = CastConfig < FuelPumpServiceConfig >(&config, totalSize);

				ret = new FuelPumpService(
					serviceConfig,
					(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID),
					CreateBooleanOutputService(serviceLocator, &config, totalSize));
				break;
			}
#endif
#ifdef FUELPUMPSERVICE_ANALOG_H
		case 2:			
			{
				FuelPumpService_AnalogConfig *serviceConfig = CastConfig < FuelPumpService_AnalogConfig >(&config, totalSize);
			
				ret = new FuelPumpService_Analog(
					serviceConfig, 
					(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID), 
					CreateFloatOutputService(serviceLocator, &config, totalSize), 
					(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
					(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
					(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID));
				break;
			}
#endif
		}
		
		if (ret != 0)
		{
			CallBackGroup *preSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(PRE_DECODER_SYNC_CALL_BACK_GROUP);
			CallBackGroup *postSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(POST_DECODER_SYNC_CALL_BACK_GROUP);
			CallBackGroup *tickSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(TICK_CALL_BACK_GROUP);
			
			preSyncCallBackGroup->Add(IFuelPumpService::PrimeCallBack, ret);
			postSyncCallBackGroup->Add(IFuelPumpService::OnCallBack, ret);
			tickSyncCallBackGroup->Add(IFuelPumpService::TickCallBack, ret);
		}
		
		return ret;
	}
	
	IInjectionConfig *EngineControlServiceBuilder::CreatePistonEngineInjetionConfig(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		IInjectionConfig *ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef INJECTIONCONFIG_SD_H
		case 2:
			ret = new InjectionConfig_SD(
				CastConfig < InjectionConfig_SDConfig >(&config, totalSize),
				(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				(IAfrService*)serviceLocator->Locate(AFR_SERVICE_ID),
				(IFuelTrimService*)serviceLocator->Locate(FUEL_TRIM_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(INTAKE_AIR_TEMPERATURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(VOLTAGE_SERVICE_ID));
			break;
#endif
#ifdef INJECTIONCONFIGWRAPPER_DFCO_H
		case 3:
			{
				InjectionConfigWrapper_DFCOConfig *injectionConfig = CastConfig < InjectionConfigWrapper_DFCOConfig >(&config, totalSize);

				unsigned int size;
				IInjectionConfig *child = CreatePistonEngineInjetionConfig(serviceLocator, config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;

				ret = new InjectionConfigWrapper_DFCO(injectionConfig, 
					(IFloatInputService*)serviceLocator->Locate(THROTTLE_POSITION_SERVICE_ID),
					(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
					child);
				break;
			}
#endif
		}
		
		return ret;
	}
	
	IIgnitionConfig *EngineControlServiceBuilder::CreateIgnitionConfig(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{	
		IIgnitionConfig *ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef IGNITIONCONFIG_STATIC_H
		case 1:
			ret = new IgnitionConfig_Static(
				CastConfig < IgnitionConfig_StaticConfig >(&config, totalSize));
			break;
#endif
#ifdef IGNITIONCONFIG_Map_Ethanol
		case 2:
			ret = new IgnitionConfig_Map_Ethanol(
				CastConfig < IgnitionConfig_Map_EthanolConfig >(&config, totalSize),
				(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(ETHANOL_CONTENT_SERVICE_ID),
				(IFloatInputService*)serviceLocator->Locate(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID));
			break;
#endif
#ifdef IGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H
		case 3:
			{
				IgnitionConfigWrapper_HardRpmLimitConfig *ignitionConfig = CastConfig < IgnitionConfigWrapper_HardRpmLimitConfig >(&config, totalSize);

				IBooleanInputService *booleanInputService = CreateBooleanInputService(serviceLocator, &config, totalSize);
				
				unsigned int size;
				IIgnitionConfig *child = CreateIgnitionConfig(serviceLocator, config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				ret = new IgnitionConfigWrapper_HardRpmLimit(
					ignitionConfig,  
					(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
					booleanInputService,
					child);
				
				break;
			}
#endif
#ifdef IGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H
		case 4:
			{
				IgnitionConfigWrapper_SoftPidRpmLimitConfig *ignitionConfig = CastConfig < IgnitionConfigWrapper_SoftPidRpmLimitConfig >(&config, totalSize);

				IBooleanInputService *booleanInputService = CreateBooleanInputService(serviceLocator, &config, totalSize);
				
				unsigned int size;
				IIgnitionConfig *child = CreateIgnitionConfig(serviceLocator, config, &size);
				config = (void *)((unsigned char *)config + size);
				*totalSize += size;
				
				ret = new IgnitionConfigWrapper_SoftPidRpmLimit(
					ignitionConfig,
					(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID), 
					(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID),
					booleanInputService,
					child);
				
				break;
			}
#endif
		}
		return ret;
	}

	IgnitionSchedulingService *EngineControlServiceBuilder::CreateIgnitionSchedulingService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		IgnitionSchedulingServiceConfig *ignitionSchedulingConfig = CastConfig < IgnitionSchedulingServiceConfig >(&config, totalSize);
		
		IIgnitionConfig *ignitionConfig = 0;
		unsigned int size;
		ignitionConfig = CreateIgnitionConfig(serviceLocator, config, &size);
		config = (void *)((unsigned char *)config + size);
		*totalSize += size;

		IgnitionSchedulingService *ret = new IgnitionSchedulingService(
			ignitionSchedulingConfig,
			ignitionConfig,
			(IBooleanOutputService**)serviceLocator->Locate(IGNITOR_SERVICES_ID),
			(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID),
			(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID));
				
		if (ret != 0)
		{
			CallBackGroup *tickSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(TICK_CALL_BACK_GROUP);
			
			tickSyncCallBackGroup->Add(IgnitionSchedulingService::ScheduleEventsCallBack, ret);
		}
		
		return ret;
	}

	InjectionSchedulingService *EngineControlServiceBuilder::CreateInjectionSchedulingService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		InjectionSchedulingServiceConfig *injectionSchedulingConfig = CastConfig < InjectionSchedulingServiceConfig >(&config, totalSize);

		IInjectionConfig *injectionConfig = 0;
		unsigned int size;
		injectionConfig = CreatePistonEngineInjetionConfig(serviceLocator, config, &size);
		config = (void *)((unsigned char *)config + size);
		*totalSize += size;
		
		InjectionSchedulingService *ret = new InjectionSchedulingService(
			injectionSchedulingConfig,
			injectionConfig,
			(IBooleanOutputService**)serviceLocator->Locate(INJECTOR_SERVICES_ID),
			(ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID),
			(ICrankCamDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID));
		
		if (ret != 0)
		{
			CallBackGroup *tickSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(TICK_CALL_BACK_GROUP);
			
			tickSyncCallBackGroup->Add(InjectionSchedulingService::ScheduleEventsCallBack, ret);
		}
		
		return ret;
	}
	
	ICrankCamDecoder *EngineControlServiceBuilder::CreateDecoderService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		ICrankCamDecoder *ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef GM24XDECODER_H
		case 1:
			ret = new Gm24xDecoder((ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID));
			break;
#endif
		}
		return ret;
	}
}