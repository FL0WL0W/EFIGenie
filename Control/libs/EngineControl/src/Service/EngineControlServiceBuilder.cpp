#include "stdlib.h"
#include "Service/EngineControlServiceBuilder.h"

namespace Service
{
	ServiceLocator *EngineControlServiceBuilder::CreateServices(ServiceLocator *serviceLocator, const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int *totalSize)
	{
		if(serviceLocator == 0)
			serviceLocator = new ServiceLocator();
		
		if(serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID) == 0)
			serviceLocator->Register(HARDWARE_ABSTRACTION_COLLECTION_ID, (void *)hardwareAbstractionCollection); //this could pose a risk if the hardwareAbstractionCollection is actually a const and it is located as non const and edited
		if(serviceLocator->Locate(ANALOG_SERVICE_ID) == 0)
			serviceLocator->Register(ANALOG_SERVICE_ID, hardwareAbstractionCollection->AnalogService);
		if(serviceLocator->Locate(DIGITAL_SERVICE_ID) == 0)
			serviceLocator->Register(DIGITAL_SERVICE_ID, hardwareAbstractionCollection->DigitalService);
		if(serviceLocator->Locate(PWM_SERVICE_ID) == 0)
			serviceLocator->Register(PWM_SERVICE_ID, hardwareAbstractionCollection->PwmService);
		if(serviceLocator->Locate(TIMER_SERVICE_ID) == 0)
			serviceLocator->Register(TIMER_SERVICE_ID, hardwareAbstractionCollection->TimerService);

		hardwareAbstractionCollection = serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID);
		
		//create callback groups
		if(serviceLocator->Locate(PRE_DECODER_SYNC_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(PRE_DECODER_SYNC_CALL_BACK_GROUP, new CallBackGroup());
		if(serviceLocator->Locate(POST_DECODER_SYNC_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(POST_DECODER_SYNC_CALL_BACK_GROUP, new CallBackGroup());
		if(serviceLocator->Locate(TICK_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(TICK_CALL_BACK_GROUP, new CallBackGroup());

		CallBackGroup *preDecoderCallBackGroup = serviceLocator->LocateAndCast<CallBackGroup>(PRE_DECODER_SYNC_CALL_BACK_GROUP);
		CallBackGroup *postDecoderCallBackGroup = serviceLocator->LocateAndCast<CallBackGroup>(POST_DECODER_SYNC_CALL_BACK_GROUP);
		CallBackGroup *tickCallBackGroup = serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP);

		*totalSize = 0;
		unsigned int size;
		unsigned short serviceId;

		while ((serviceId = *reinterpret_cast<const unsigned short *>(config)) != 0)
		{
			OffsetConfig(&config, totalSize, sizeof(const unsigned short));

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
					AddToCallBackGroupIfParametersNotNull(tickCallBackGroup, IFloatInputService::ReadValueCallBack, floatInputService);
					RegisterIfNotNull(serviceLocator, serviceId, floatInputService);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#if IGNITOR_SERVICES_ID
			case IGNITOR_SERVICES_ID:
#endif
#if INJECTOR_SERVICES_ID
			case INJECTOR_SERVICES_ID:
#endif
				{
					const unsigned char numberOfServices = *reinterpret_cast<const unsigned char *>(config);
					OffsetConfig(&config, totalSize, 1);

					IBooleanOutputService **serviceArray = (IBooleanOutputService **)malloc(sizeof(IBooleanOutputService *)*(numberOfServices + 1));
					for (int i = 0; i < numberOfServices; i++)
					{
						serviceArray[i] = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &size);
						OffsetConfig(&config, totalSize, size);
					}
					serviceArray[numberOfServices] = 0;
					serviceLocator->Register(serviceId, serviceArray);
					break;
				}
#if TACHOMETER_SERVICE_ID
			case TACHOMETER_SERVICE_ID:
				{
					TachometerService *tachometerService = CreateTachometerService(serviceLocator, config, &size);
					RegisterIfNotNull(serviceLocator, serviceId, tachometerService);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#endif
#if IDLE_AIR_CONTROL_VALVE_SERVICE_ID
			case IDLE_AIR_CONTROL_VALVE_SERVICE_ID:
				{
					IFloatOutputService *intakeAirControlValveService = IFloatOutputService::CreateFloatOutputService(hardwareAbstractionCollection, config, &size);
					RegisterIfNotNull(serviceLocator, serviceId, intakeAirControlValveService);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#endif
#if PRIME_SERVICE_ID
			case PRIME_SERVICE_ID:
				{
					IPrimeService *primeService = CreatePrimeService(serviceLocator, config, &size);
					RegisterIfNotNull(serviceLocator, serviceId, primeService);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#endif
#if IDLE_CONTROL_SERVICE_ID
			case IDLE_CONTROL_SERVICE_ID:
				{
					IIdleControlService *idleControlService = CreateIdleControlService(serviceLocator, config, &size);
					RegisterIfNotNull(serviceLocator, serviceId, idleControlService);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#endif
#if AFR_SERVICE_ID
			case AFR_SERVICE_ID:
				{
					IAfrService *afrService = CreateAfrService(serviceLocator, config, &size);
					RegisterIfNotNull(serviceLocator, serviceId, afrService);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#endif
#if FUEL_TRIM_SERVICE_ID
			case FUEL_TRIM_SERVICE_ID:
				{
					IFuelTrimService *fuelTrimService = CreateFuelTrimService(serviceLocator, config, &size);
					RegisterIfNotNull(serviceLocator, serviceId, fuelTrimService);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#endif
#if FUEL_PUMP_SERVICE_ID
			case FUEL_PUMP_SERVICE_ID:
				{
					IFuelPumpService *fuelPumpService = CreateFuelPumpService(serviceLocator, config, &size);
					RegisterIfNotNull(serviceLocator, serviceId, fuelPumpService);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#endif
#if IGNITION_SCHEDULING_SERVICE_ID
			case IGNITION_SCHEDULING_SERVICE_ID:
				{
					IgnitionSchedulingService *ignitionSchedulingService = CreateIgnitionSchedulingService(serviceLocator, config, &size);
					RegisterIfNotNull(serviceLocator, serviceId, ignitionSchedulingService);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#endif
#if INJECTION_SCHEDULING_SERVICE_ID
			case INJECTION_SCHEDULING_SERVICE_ID:
				{
					InjectionSchedulingService *injectionSchedulingService = CreateInjectionSchedulingService(serviceLocator, config, &size);
					RegisterIfNotNull(serviceLocator, serviceId, injectionSchedulingService);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#endif
#if DECODER_SERVICE_ID
			case DECODER_SERVICE_ID:
				{
					ICrankCamDecoder *decoder = CreateDecoderService(serviceLocator, config, &size);
					RegisterIfNotNull(serviceLocator, serviceId, decoder);
					OffsetConfig(&config, totalSize, size);
					break;
				}
#endif
			}
		}

		return serviceLocator;
	}
	
	TachometerService *EngineControlServiceBuilder::CreateTachometerService(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
	{		
		*totalSize = 0;
				
		return new TachometerService(
			CastConfig < TachometerServiceConfig >(&config, totalSize),
			CreateBooleanOutputService(serviceLocator, &config, totalSize),
			serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
			serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID));
	}
	
	IPrimeService* EngineControlServiceBuilder::CreatePrimeService(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
	{
		IPrimeService* ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 1:
			ret = new PrimeService_StaticPulseWidth(
				CastConfig < PrimeService_StaticPulseWidthConfig >(&config, totalSize), 
				serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID), 
				serviceLocator->LocateAndCast<IBooleanOutputService *>(INJECTOR_SERVICES_ID));
			break;
#endif
		}
		
		AddToCallBackGroupIfParametersNotNull(
			serviceLocator->LocateAndCast<CallBackGroup>(POST_DECODER_SYNC_CALL_BACK_GROUP), 
			IPrimeService::PrimeCallBack,
			ret);

		AddToCallBackGroupIfParametersNotNull(
			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP), 
			IPrimeService::TickCallBack,
			ret);
		
		return ret;
	}
	
	IIdleControlService* EngineControlServiceBuilder::CreateIdleControlService(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
	{
		IIdleControlService*ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 1:	
			ret = new IdleControlService_Pid(
				CastConfig < IdleControlService_PidConfig >(&config, totalSize),  
				serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), 
				serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID), 
				serviceLocator->LocateAndCast<IFloatInputService>(THROTTLE_POSITION_SERVICE_ID), 
				serviceLocator->LocateAndCast<IFloatInputService>(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID), 
				serviceLocator->LocateAndCast<IFloatInputService>(VEHICLE_SPEED_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(INTAKE_AIR_TEMPERATURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatOutputService>(IDLE_AIR_CONTROL_VALVE_SERVICE_ID));
			break;
#endif
		}
		
		AddToCallBackGroupIfParametersNotNull(
			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP), 
			IIdleControlService::TickCallBack,
			ret);
		
		return ret;
	}
	
	IAfrService *EngineControlServiceBuilder::CreateAfrService(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
	{		
		IAfrService *ret = 0;
		switch (GetServiceId(&config, totalSize))
		{
#ifdef AFRSERVICE_STATIC_H
		case 1:
			*totalSize += 1;
			ret = new AfrService_Static(*reinterpret_cast<const float *>(config));
			break;
#endif
#ifdef AFRSERVICE_MAP_ETHANOL_H
		case 2:
			ret = new AfrService_Map_Ethanol(
				CastConfig < AfrService_Map_EthanolConfig >(&config, totalSize),  
				serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
				serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(ETHANOL_CONTENT_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(THROTTLE_POSITION_SERVICE_ID));
			break;
#endif
		}
		
		AddToCallBackGroupIfParametersNotNull(
			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP), 
			IAfrService::CalculateAfrCallBack,
			ret);
		
		return ret;
	}
	
	IFuelTrimService *EngineControlServiceBuilder::CreateFuelTrimService(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
	{
		IFuelTrimService *ret = 0;
		switch (GetServiceId(&config, totalSize))
		{
#ifdef FUELTRIMSERVICE_INTERPOLATEDTABLE_H
		case 1:
			{
				const FuelTrimService_InterpolatedTableConfig *serviceConfig = CastConfig < FuelTrimService_InterpolatedTableConfig >(&config, totalSize);
				
				ret = new FuelTrimService_InterpolatedTable(
					serviceConfig, 
					serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID), 
					serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID),
					serviceLocator->LocateAndCast<IFloatInputService>(THROTTLE_POSITION_SERVICE_ID),
					serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
					CreateFloatInputService(serviceLocator, &config, totalSize),
					serviceLocator->LocateAndCast<IAfrService>(AFR_SERVICE_ID));
				break;
			}
#endif
#ifdef FUELTRIMSERVICEWRAPPER_MULTICHANNEL_H
		case 2:
			{
				const FuelTrimServiceWrapper_MultiChannelConfig *fuelTrimConfig = CastConfig < FuelTrimServiceWrapper_MultiChannelConfig >(&config, totalSize);
				
				IFuelTrimService **fuelTrimServices = (IFuelTrimService **)malloc(sizeof(IFuelTrimService *)*(fuelTrimConfig->NumberOfFuelTrimChannels));
				
				for (int i = 0; i < fuelTrimConfig->NumberOfFuelTrimChannels; i++)
				{
					unsigned int size;
					fuelTrimServices[i] = CreateFuelTrimService(serviceLocator, config, &size);
					OffsetConfig(&config, totalSize, size);
				}
			
				ret = new FuelTrimServiceWrapper_MultiChannel(fuelTrimConfig, fuelTrimServices);
				break;
			}
#endif
		}
		
		AddToCallBackGroupIfParametersNotNull(
			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP), 
			IFuelTrimService::TickCallBack,
			ret);
		
		return ret;
	}
	
	IFuelPumpService *EngineControlServiceBuilder::CreateFuelPumpService(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
	{
		IFuelPumpService *ret = 0;
		switch (GetServiceId(&config, totalSize))
		{
#ifdef FUELPUMPSERVICE_H
		case 1:
			{
				const FuelPumpServiceConfig *serviceConfig = CastConfig < FuelPumpServiceConfig >(&config, totalSize);

				ret = new FuelPumpService(
					serviceConfig,
					serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
					CreateBooleanOutputService(serviceLocator, &config, totalSize));
				break;
			}
#endif
#ifdef FUELPUMPSERVICE_ANALOG_H
		case 2:			
			{
				const FuelPumpService_AnalogConfig *serviceConfig = CastConfig < FuelPumpService_AnalogConfig >(&config, totalSize);
			
				ret = new FuelPumpService_Analog(
					serviceConfig, 
					serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID), 
					CreateFloatOutputService(serviceLocator, &config, totalSize), 
					serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID),
					serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
					serviceLocator->LocateAndCast<IFloatInputService>(THROTTLE_POSITION_SERVICE_ID));
				break;
			}
#endif
		}
		
		AddToCallBackGroupIfParametersNotNull(
			serviceLocator->LocateAndCast<CallBackGroup>(PRE_DECODER_SYNC_CALL_BACK_GROUP), 
			IFuelPumpService::PrimeCallBack,
			ret);
		AddToCallBackGroupIfParametersNotNull(
			serviceLocator->LocateAndCast<CallBackGroup>(POST_DECODER_SYNC_CALL_BACK_GROUP), 
			IFuelPumpService::OnCallBack,
			ret);
		AddToCallBackGroupIfParametersNotNull(
			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP), 
			IFuelPumpService::TickCallBack,
			ret);
		
		return ret;
	}
	
	IInjectionConfig *EngineControlServiceBuilder::CreateInjectionConfig(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
	{
		IInjectionConfig *ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef INJECTIONCONFIG_SD_H
		case 2:
			ret = new InjectionConfig_SD(
				CastConfig < InjectionConfig_SDConfig >(&config, totalSize),
				serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IAfrService>(AFR_SERVICE_ID),
				serviceLocator->LocateAndCast<IFuelTrimService>(FUEL_TRIM_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(INTAKE_AIR_TEMPERATURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(THROTTLE_POSITION_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(VOLTAGE_SERVICE_ID));
			break;
#endif
#ifdef INJECTIONCONFIGWRAPPER_DFCO_H
		case 3:
			{
				const InjectionConfigWrapper_DFCOConfig *injectionConfig = CastConfig < InjectionConfigWrapper_DFCOConfig >(&config, totalSize);

				unsigned int size;
				IInjectionConfig *child = CreateInjectionConfig(serviceLocator, config, &size);
				OffsetConfig(&config, totalSize, size);

				ret = new InjectionConfigWrapper_DFCO(injectionConfig, 
					serviceLocator->LocateAndCast<IFloatInputService>(THROTTLE_POSITION_SERVICE_ID),
					serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID),
					child);
				break;
			}
#endif
		}
		
		return ret;
	}
	
	IIgnitionConfig *EngineControlServiceBuilder::CreateIgnitionConfig(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
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
#ifdef IGNITIONCONFIG_MAP_ETHANOL_H
		case 2:
			ret = new IgnitionConfig_Map_Ethanol(
				CastConfig < IgnitionConfig_Map_EthanolConfig >(&config, totalSize),
				serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(ETHANOL_CONTENT_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID));
			break;
#endif
#ifdef IGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H
		case 3:
			{
				const IgnitionConfigWrapper_HardRpmLimitConfig *ignitionConfig = CastConfig < IgnitionConfigWrapper_HardRpmLimitConfig >(&config, totalSize);

				IBooleanInputService *booleanInputService = CreateBooleanInputService(serviceLocator, &config, totalSize);
				
				unsigned int size;
				IIgnitionConfig *child = CreateIgnitionConfig(serviceLocator, config, &size);
				OffsetConfig(&config, totalSize, size);
				
				ret = new IgnitionConfigWrapper_HardRpmLimit(
					ignitionConfig,  
					serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID),
					booleanInputService,
					child);
				
				break;
			}
#endif
#ifdef IGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H
		case 4:
			{
				const IgnitionConfigWrapper_SoftPidRpmLimitConfig *ignitionConfig = CastConfig < IgnitionConfigWrapper_SoftPidRpmLimitConfig >(&config, totalSize);

				IBooleanInputService *booleanInputService = CreateBooleanInputService(serviceLocator, &config, totalSize);
				
				unsigned int size;
				IIgnitionConfig *child = CreateIgnitionConfig(serviceLocator, config, &size);
				OffsetConfig(&config, totalSize, size);
				
				ret = new IgnitionConfigWrapper_SoftPidRpmLimit(
					ignitionConfig,
					serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID), 
					serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID),
					booleanInputService,
					child);
				
				break;
			}
#endif
		}
		return ret;
	}

	IgnitionSchedulingService *EngineControlServiceBuilder::CreateIgnitionSchedulingService(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
	{
		const IgnitionSchedulingServiceConfig *ignitionSchedulingConfig = CastConfig < IgnitionSchedulingServiceConfig >(&config, totalSize);
		
		IIgnitionConfig *ignitionConfig = 0;
		unsigned int size;
		ignitionConfig = CreateIgnitionConfig(serviceLocator, config, &size);
		OffsetConfig(&config, totalSize, size);

		IgnitionSchedulingService *ret = new IgnitionSchedulingService(
			ignitionSchedulingConfig,
			ignitionConfig,
			serviceLocator->LocateAndCast<IBooleanOutputService *>(IGNITOR_SERVICES_ID),
			serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
			serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID));
				
		AddToCallBackGroupIfParametersNotNull(
			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP), 
			IgnitionSchedulingService::ScheduleEventsCallBack,
			ret);
		
		return ret;
	}

	InjectionSchedulingService *EngineControlServiceBuilder::CreateInjectionSchedulingService(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
	{
		const InjectionSchedulingServiceConfig *injectionSchedulingConfig = CastConfig < InjectionSchedulingServiceConfig >(&config, totalSize);

		IInjectionConfig *injectionConfig = 0;
		unsigned int size;
		injectionConfig = CreateInjectionConfig(serviceLocator, config, &size);
		OffsetConfig(&config, totalSize, size);
		
		InjectionSchedulingService *ret = new InjectionSchedulingService(
			injectionSchedulingConfig,
			injectionConfig,
			serviceLocator->LocateAndCast<IBooleanOutputService *>(INJECTOR_SERVICES_ID),
			serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
			serviceLocator->LocateAndCast<ICrankCamDecoder>(DECODER_SERVICE_ID));
		
		AddToCallBackGroupIfParametersNotNull(
			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP), 
			InjectionSchedulingService::ScheduleEventsCallBack,
			ret);
		
		return ret;
	}
	
	ICrankCamDecoder *EngineControlServiceBuilder::CreateDecoderService(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
	{
		ICrankCamDecoder *ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef GM24XDECODER_H
		case 1:
			ret = new Gm24xDecoder(serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID));
			break;
#endif
		}
		return ret;
	}
}