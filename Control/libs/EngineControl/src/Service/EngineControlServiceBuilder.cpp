#include "stdlib.h"
#include "Service/EngineControlServiceBuilder.h"
#include "Service/ServiceBuilder.h"

namespace Service
{
	ServiceLocator *EngineControlServiceBuilder::CreateServices(ServiceLocator *serviceLocator, const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut)
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
		if(serviceLocator->Locate(PRE_RELUCTOR_SYNC_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(PRE_RELUCTOR_SYNC_CALL_BACK_GROUP, new CallBackGroup());
		if(serviceLocator->Locate(POST_RELUCTOR_SYNC_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(POST_RELUCTOR_SYNC_CALL_BACK_GROUP, new CallBackGroup());
		if(serviceLocator->Locate(TICK_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(TICK_CALL_BACK_GROUP, new CallBackGroup());

		CallBackGroup *preReluctorCallBackGroup = serviceLocator->LocateAndCast<CallBackGroup>(PRE_RELUCTOR_SYNC_CALL_BACK_GROUP);
		CallBackGroup *postReluctorCallBackGroup = serviceLocator->LocateAndCast<CallBackGroup>(POST_RELUCTOR_SYNC_CALL_BACK_GROUP);
		CallBackGroup *tickCallBackGroup = serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP);

		sizeOut = 0;

		ServiceBuilder *serviceBuilder = new ServiceBuilder();

#if INTAKE_AIR_TEMPERATURE_SERVICE_ID
		serviceBuilder->Register(INTAKE_AIR_TEMPERATURE_SERVICE_ID, IFloatInputService::CreateFloatInputService);
#endif
#if ENGINE_COOLANT_TEMPERATURE_SERVICE_ID
		serviceBuilder->Register(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID, IFloatInputService::CreateFloatInputService);
#endif
#if MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID
		serviceBuilder->Register(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID, IFloatInputService::CreateFloatInputService);
#endif
#if VOLTAGE_SERVICE_ID
		serviceBuilder->Register(VOLTAGE_SERVICE_ID, IFloatInputService::CreateFloatInputService);
#endif
#if THROTTLE_POSITION_SERVICE_ID
		serviceBuilder->Register(THROTTLE_POSITION_SERVICE_ID, IFloatInputService::CreateFloatInputService);
#endif
#if ETHANOL_CONTENT_SERVICE_ID
		serviceBuilder->Register(ETHANOL_CONTENT_SERVICE_ID, IFloatInputService::CreateFloatInputService);
#endif
#if VEHICLE_SPEED_SERVICE_ID
		serviceBuilder->Register(VEHICLE_SPEED_SERVICE_ID, IFloatInputService::CreateFloatInputService);
#endif
#if TACHOMETER_SERVICE_ID
		serviceBuilder->Register(TACHOMETER_SERVICE_ID, TachometerService::CreateTachometerService);
#endif
#if IDLE_AIR_CONTROL_VALVE_SERVICE_ID
		serviceBuilder->Register(IDLE_AIR_CONTROL_VALVE_SERVICE_ID, IFloatOutputService::CreateFloatOutputService);
#endif
#if PRIME_SERVICE_ID
		serviceBuilder->Register(PRIME_SERVICE_ID, IPrimeService::CreatePrimeService);
#endif
#if IDLE_CONTROL_SERVICE_ID
		serviceBuilder->Register(IDLE_CONTROL_SERVICE_ID, IIdleControlService::CreateIdleControlService);
#endif
#if AFR_SERVICE_ID
		serviceBuilder->Register(AFR_SERVICE_ID, IAfrService::CreateAfrService);
#endif
#if FUEL_TRIM_SERVICE_ID
		serviceBuilder->Register(FUEL_TRIM_SERVICE_ID, IFuelTrimService::CreateFuelTrimService);
#endif
#if FUEL_PUMP_SERVICE_ID
		serviceBuilder->Register(FUEL_PUMP_SERVICE_ID, IFuelPumpService::CreateFuelPumpService);
#endif
#if IGNITION_SCHEDULING_SERVICE_ID
		serviceBuilder->Register(IGNITION_SCHEDULING_SERVICE_ID, CreateIgnitionSchedulingService);
#endif
#if CRANK_RELUCTOR_SERVICE_ID
		serviceBuilder->Register(CRANK_RELUCTOR_SERVICE_ID, CreateReluctor);
#endif
#if CAM_RELUCTOR_SERVICE_ID
		serviceBuilder->Register(CAM_RELUCTOR_SERVICE_ID, CreateReluctor);
#endif
#if IGNITOR_SERVICES_ID
		serviceBuilder->Register(IGNITOR_SERVICES_ID, CreateBooleanOutputArray);
#endif
#if INJECTOR_SERVICES_ID
		serviceBuilder->Register(INJECTOR_SERVICES_ID, CreateBooleanOutputArray);
#endif

// #if INJECTION_SCHEDULING_SERVICE_ID
// 			case INJECTION_SCHEDULING_SERVICE_ID:
// 				{
// 					InjectionSchedulingService *injectionSchedulingService = CreateInjectionSchedulingService(serviceLocator, config, &size);
// 					ServiceBuilder::RegisterIfNotNull(serviceLocator, serviceId, injectionSchedulingService);
// 					ServiceBuilder::OffsetConfig(config, totalSize, size);
// 					break;
// 				}
// #endif

		serviceBuilder->Build(serviceLocator, config, sizeOut);

		return serviceLocator;
	}
	
// 	IInjectionConfig *EngineControlServiceBuilder::CreateInjectionConfig(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
// 	{
// 		*totalSize = 0;

// 		IInjectionConfig *ret = 0;
		
// 		switch (ServiceBuilder::GetServiceTypeId(config, *totalSize))
// 		{
// #ifdef INJECTIONCONFIG_SD_H
// 		case 2:
// 			ret = new InjectionConfig_SD(
// 				ServiceBuilder::CastConfig < InjectionConfig_SDConfig >(config, *totalSize),
// 				serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID),
// 				serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
// 				serviceLocator->LocateAndCast<IAfrService>(AFR_SERVICE_ID),
// 				serviceLocator->LocateAndCast<IFuelTrimService>(FUEL_TRIM_SERVICE_ID),
// 				serviceLocator->LocateAndCast<IFloatInputService>(INTAKE_AIR_TEMPERATURE_SERVICE_ID),
// 				serviceLocator->LocateAndCast<IFloatInputService>(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
// 				serviceLocator->LocateAndCast<IFloatInputService>(THROTTLE_POSITION_SERVICE_ID),
// 				serviceLocator->LocateAndCast<IFloatInputService>(VOLTAGE_SERVICE_ID));
// 			break;
// #endif
// #ifdef INJECTIONCONFIGWRAPPER_DFCO_H
// 		case 3:
// 			{
// 				const InjectionConfigWrapper_DFCOConfig *injectionConfig = ServiceBuilder::CastConfig < InjectionConfigWrapper_DFCOConfig >(config, *totalSize);

// 				unsigned int size;
// 				IInjectionConfig *child = CreateInjectionConfig(serviceLocator, config, &size);
// 				ServiceBuilder::OffsetConfig(config, *totalSize, size);

// 				ret = new InjectionConfigWrapper_DFCO(injectionConfig, 
// 					serviceLocator->LocateAndCast<IFloatInputService>(THROTTLE_POSITION_SERVICE_ID),
// 					serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID),
// 					child);
// 				break;
// 			}
// #endif
// 		}
		
// 		return ret;
// 	}
	
	void* EngineControlServiceBuilder::CreateBooleanOutputArray(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		
		const unsigned char numberOfServices = *reinterpret_cast<const unsigned char *>(config);
		ServiceBuilder::OffsetConfig(config, sizeOut, 1);

		IBooleanOutputService **serviceArray = (IBooleanOutputService **)malloc(sizeof(IBooleanOutputService *)*(numberOfServices + 1));
		for (int i = 0; i < numberOfServices; i++)
		{
			serviceArray[i] = ServiceBuilder::CreateServiceAndOffset<IBooleanOutputService>(IBooleanOutputService::CreateBooleanOutputService, serviceLocator, config, sizeOut);
		}
		serviceArray[numberOfServices] = 0;

		return serviceArray;
	}
	
	void* EngineControlServiceBuilder::CreateIgnitionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;

		const IgnitionSchedulingServiceConfig *ignitionSchedulingConfig = ServiceBuilder::CastConfig < IgnitionSchedulingServiceConfig >(config, sizeOut);
		
		IIgnitionConfig *ignitionConfig = 0;
		ignitionConfig = ServiceBuilder::CreateServiceAndOffset<IIgnitionConfig>(IIgnitionConfig::CreateIgnitionConfig, serviceLocator, config, sizeOut);

		IgnitionSchedulingService *ret = new IgnitionSchedulingService(
			ignitionSchedulingConfig,
			ignitionConfig,
			serviceLocator->LocateAndCast<IBooleanOutputService *>(IGNITOR_SERVICES_ID),
			serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
			serviceLocator->LocateAndCast<IReluctor>(CRANK_RELUCTOR_SERVICE_ID),
			serviceLocator->LocateAndCast<IReluctor>(CAM_RELUCTOR_SERVICE_ID));
				
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IgnitionSchedulingService::ScheduleEventsCallBack,
			ret);
		
		return ret;
	}

// 	InjectionSchedulingService *EngineControlServiceBuilder::CreateInjectionSchedulingService(ServiceLocator *serviceLocator, const void *config, unsigned int *totalSize)
// 	{
// 		*totalSize = 0;
		
// 		const InjectionSchedulingServiceConfig *injectionSchedulingConfig = ServiceBuilder::CastConfig < InjectionSchedulingServiceConfig >(config, *totalSize);

// 		IInjectionConfig *injectionConfig = 0;
// 		unsigned int size;
// 		injectionConfig = CreateInjectionConfig(serviceLocator, config, &size);
// 		ServiceBuilder::OffsetConfig(config, *totalSize, size);
		
// 		InjectionSchedulingService *ret = new InjectionSchedulingService(
// 			injectionSchedulingConfig,
// 			injectionConfig,
// 			serviceLocator->LocateAndCast<IBooleanOutputService *>(INJECTOR_SERVICES_ID),
// 			serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
// 			serviceLocator->LocateAndCast<IReluctor>(CRANK_RELUCTOR_SERVICE_ID),
// 			serviceLocator->LocateAndCast<IReluctor>(CAM_RELUCTOR_SERVICE_ID));
		
// 		AddToCallBackGroupIfParametersNotNull(
// 			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP), 
// 			InjectionSchedulingService::ScheduleEventsCallBack,
// 			ret);
		
// 		return ret;
// 	}
	
	void EngineControlServiceBuilder::RegisterRpmService(ServiceLocator *serviceLocator)
	{
		RpmService *existing = serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID);

		if(existing != 0)
		{
			existing->_crankReluctor = serviceLocator->LocateAndCast<IReluctor>(CRANK_RELUCTOR_SERVICE_ID);
			existing->_camReluctor = serviceLocator->LocateAndCast<IReluctor>(CAM_RELUCTOR_SERVICE_ID);
		}
		else
		{
			RpmService *rpmService = new RpmService(
				serviceLocator->LocateAndCast<IReluctor>(CRANK_RELUCTOR_SERVICE_ID), 
				serviceLocator->LocateAndCast<IReluctor>(CAM_RELUCTOR_SERVICE_ID));

			ServiceBuilder::RegisterIfNotNull(serviceLocator, RPM_SERVICE_ID, rpmService);
			
			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
				RpmService::TickCallBack,
				rpmService);
		}
	}

	void* EngineControlServiceBuilder::CreateReluctor(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		IReluctor *ret = 0;
		
		switch (ServiceBuilder::GetServiceTypeId(config, sizeOut))
		{
#ifdef GM24XRELUCTOR_H
		case 1:
			ret = new Gm24xReluctor(serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), *reinterpret_cast<const uint16_t *>(config));
			ServiceBuilder::OffsetConfig(config, sizeOut, sizeof(uint16_t));
			break;
#endif
#ifdef UNIVERSAL2XRELUCTOR_H
		case 2:
			ret = new Universal2xReluctor(serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), ServiceBuilder::CastConfig < Universal2xReluctorConfig >(config, sizeOut));
			break;
#endif
		}
		return ret;
	}
}