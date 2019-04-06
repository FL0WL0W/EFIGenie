#include "stdlib.h"
#include "Service/EngineControlServiceBuilder.h"
#include "Service/ServiceBuilder.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Service/IOServicesServiceBuilderRegister.h"

namespace Service
{
	ServiceLocator *EngineControlServiceBuilder::CreateServices(ServiceLocator *serviceLocator, HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut)
	{
		if(serviceLocator == 0)
			serviceLocator = new ServiceLocator();
		
		if(serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID) == 0)
			HardwareAbstractionServiceBuilder::Build(serviceLocator, hardwareAbstractionCollection);

		hardwareAbstractionCollection = serviceLocator->LocateAndCast<HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID);
		
		//create callback groups
		if(serviceLocator->Locate(PRE_RELUCTOR_SYNC_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(PRE_RELUCTOR_SYNC_CALL_BACK_GROUP, new CallBackGroup());
		if(serviceLocator->Locate(POST_RELUCTOR_SYNC_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(POST_RELUCTOR_SYNC_CALL_BACK_GROUP, new CallBackGroup());

		sizeOut = 0;

		ServiceBuilder *serviceBuilder = new ServiceBuilder();

		IOServicesServiceBuilderRegister::Register(serviceBuilder);

		//inputs
#if CRANK_RELUCTOR_SERVICE_ID
		serviceBuilder->Register(CRANK_RELUCTOR_SERVICE_ID, CreateReluctor);
#endif
#if CAM_RELUCTOR_SERVICE_ID
		serviceBuilder->Register(CAM_RELUCTOR_SERVICE_ID, CreateReluctor);
#endif

	//outputs
#if IGNITOR_SERVICES_ID
		serviceBuilder->Register(IGNITOR_SERVICES_ID, CreateBooleanOutputArray);
#endif
#if INJECTOR_SERVICES_ID
		serviceBuilder->Register(INJECTOR_SERVICES_ID, CreateBooleanOutputArray);
#endif

	//application services
#if TACHOMETER_SERVICE_ID
		serviceBuilder->Register(TACHOMETER_SERVICE_ID, TachometerService::CreateTachometerService);
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
#if CYLINDER_AIR_TEMPERATURE_SERVICE_ID
		serviceBuilder->Register(CYLINDER_AIR_TEMPERATURE_SERVICE_ID, ICylinderAirTemperatureService::CreateCylinderAirTemperatureService);
#endif
#if CYLINDER_AIRMASS_SERVICE_ID
		serviceBuilder->Register(CYLINDER_AIRMASS_SERVICE_ID, ICylinderAirmassService::CreateCylinderAirmassService);
#endif
#if INJECTOR_GRAM_SERVICE_ID
		serviceBuilder->Register(INJECTOR_GRAM_SERVICE_ID, IInjectorGramService::CreateInjectorGramService);
#endif
#if INJECTOR_TIMING_SERVICE_ID
		serviceBuilder->Register(INJECTOR_TIMING_SERVICE_ID, IInjectorTimingService::CreateInjectorTimingService);
#endif
#if IGNITION_SCHEDULING_SERVICE_ID
		serviceBuilder->Register(IGNITION_SCHEDULING_SERVICE_ID, CreateIgnitionSchedulingService);
#endif
#if INJECTION_SCHEDULING_SERVICE_ID
		serviceBuilder->Register(INJECTION_SCHEDULING_SERVICE_ID, CreateInjectionSchedulingService);
#endif

		//hack until i can find a better way to register the rpm service. probably going to create an initialize callback for this and CylinderAirTemperatureService_IAT_ECT_Bias
		RegisterRpmService(serviceLocator);

		serviceBuilder->Build(serviceLocator, config, sizeOut);

		RegisterRpmService(serviceLocator);

		return serviceLocator;
	}
	
	void* EngineControlServiceBuilder::CreateBooleanOutputArray(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		
		const unsigned char numberOfServices = *reinterpret_cast<const unsigned char *>(config);
		ServiceBuilder::OffsetConfig(config, sizeOut, 1);

		IBooleanOutputService **serviceArray = (IBooleanOutputService **)malloc(sizeof(IBooleanOutputService *)*(numberOfServices + 1));
		for (int i = 0; i < numberOfServices; i++)
		{
			serviceArray[i] = ServiceBuilder::CreateServiceAndOffset<IBooleanOutputService>(IBooleanOutputService::BuildBooleanOutputService, serviceLocator, config, sizeOut);
		}
		serviceArray[numberOfServices] = 0;

		return serviceArray;
	}
	
	void* EngineControlServiceBuilder::CreateIgnitionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;

		const IgnitionSchedulingServiceConfig *ignitionSchedulingConfig = ServiceBuilder::CastConfigAndOffset < IgnitionSchedulingServiceConfig >(config, sizeOut);
		
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

	void *EngineControlServiceBuilder::CreateInjectionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		
		InjectionSchedulingService *ret = new InjectionSchedulingService(
			ServiceBuilder::CastConfigAndOffset < InjectionSchedulingServiceConfig >(config, sizeOut),
			serviceLocator->LocateAndCast<IInjectorTimingService>(INJECTOR_TIMING_SERVICE_ID),
			serviceLocator->LocateAndCast<IBooleanOutputService *>(INJECTOR_SERVICES_ID),
			serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
			serviceLocator->LocateAndCast<IReluctor>(CRANK_RELUCTOR_SERVICE_ID),
			serviceLocator->LocateAndCast<IReluctor>(CAM_RELUCTOR_SERVICE_ID));
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			InjectionSchedulingService::ScheduleEventsCallBack,
			ret);
		
		return ret;
	}
	
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

			serviceLocator->RegisterIfNotNull(RPM_SERVICE_ID, rpmService);
			
			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
				RpmService::TickCallBack,
				rpmService);
		}
	}

	void* EngineControlServiceBuilder::CreateReluctor(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		IReluctor *ret = 0;		
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{
#ifdef GM24XRELUCTOR_H
		case 1:
			ret = new Gm24xReluctor(serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), *reinterpret_cast<const uint16_t *>(config));
			ServiceBuilder::OffsetConfig(config, sizeOut, sizeof(uint16_t));
			break;
#endif
#ifdef UNIVERSAL2XRELUCTOR_H
		case 2:
			ret = new Universal2xReluctor(serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), ServiceBuilder::CastConfigAndOffset < Universal2xReluctorConfig >(config, sizeOut));
			break;
#endif
		}

		return ret;
	}
}