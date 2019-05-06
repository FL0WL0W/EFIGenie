#include "stdlib.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/IOServicesServiceBuilderRegister.h"
#include "Service/ReluctorServiceBuilderRegister.h"
#include "Service/ServiceBuilder.h"
#include "Service/HardwareAbstractionServiceBuilder.h"

using namespace Reluctor;

namespace Service
{
	void EngineControlServicesServiceBuilderRegister::Register(ServiceBuilder *&serviceBuilder)
	{
	//outputs
#if BUILDER_IBOOLEANOUTPUTSERVICEARRAY
		serviceBuilder->Register(BUILDER_IBOOLEANOUTPUTSERVICEARRAY, CreateBooleanOutputArray);
#endif
	//application services
#if BUILDER_TACHOMETERSERVICE
		serviceBuilder->Register(BUILDER_TACHOMETERSERVICE, TachometerService::CreateTachometerService);
#endif
#if BUILDER_IPRIMESERVICE
		serviceBuilder->Register(BUILDER_IPRIMESERVICE, IPrimeService::CreatePrimeService);
#endif
#if BUILDER_IIDLECONTROLSERVICE
		serviceBuilder->Register(BUILDER_IIDLECONTROLSERVICE, IIdleControlService::CreateIdleControlService);
#endif
#if BUILDER_IAFRSERVICE
		serviceBuilder->Register(BUILDER_IAFRSERVICE, IAfrService::CreateAfrService);
#endif
#if BUILDER_IFUELTRIMSERVICE
		serviceBuilder->Register(BUILDER_IFUELTRIMSERVICE, IFuelTrimService::CreateFuelTrimService);
#endif
#if BUILDER_IFUELPUMPSERVICE
		serviceBuilder->Register(BUILDER_IFUELPUMPSERVICE, IFuelPumpService::CreateFuelPumpService);
#endif
#if BUILDER_ICYLINDERAIRTEMPERATURESERVICE
		serviceBuilder->Register(BUILDER_ICYLINDERAIRTEMPERATURESERVICE, ICylinderAirTemperatureService::CreateCylinderAirTemperatureService);
#endif
#if BUILDER_ICYLINDERAIRMASSSERVICE
		serviceBuilder->Register(BUILDER_ICYLINDERAIRMASSSERVICE, ICylinderAirmassService::CreateCylinderAirmassService);
#endif
#if BUILDER_IINJECTORGRAMSERVICE
		serviceBuilder->Register(BUILDER_IINJECTORGRAMSERVICE, IInjectorGramService::CreateInjectorGramService);
#endif
#if BUILDER_IINJECTORTIMINGSERVICE
		serviceBuilder->Register(BUILDER_IINJECTORTIMINGSERVICE, IInjectorTimingService::CreateInjectorTimingService);
#endif
#if BUILDER_IIGNITIONSCHEDULINGSERVICE
		serviceBuilder->Register(BUILDER_IIGNITIONSCHEDULINGSERVICE, CreateIgnitionSchedulingService);
#endif
#if BUILDER_IINJECTIONSCHEDULINGSERVICE
		serviceBuilder->Register(BUILDER_IINJECTIONSCHEDULINGSERVICE, CreateInjectionSchedulingService);
#endif
	}

	ServiceLocator *EngineControlServicesServiceBuilderRegister::CreateServices(ServiceLocator *serviceLocator, HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut)
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
		ReluctorServiceBuilderRegister::Register(serviceBuilder);
		Register(serviceBuilder);

		//hack until i can find a better way to register the rpm service. probably going to create an initialize callback for this and CylinderAirTemperatureService_IAT_ECT_Bias
		RegisterRpmService(serviceLocator);

		serviceBuilder->Build(serviceLocator, config, sizeOut);

		RegisterRpmService(serviceLocator);

		return serviceLocator;
	}
	
	void* EngineControlServicesServiceBuilderRegister::CreateBooleanOutputArray(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
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
	
	void* EngineControlServicesServiceBuilderRegister::CreateIgnitionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;

		const IgnitionSchedulingServiceConfig *ignitionSchedulingConfig = ServiceBuilder::CastConfigAndOffset < IgnitionSchedulingServiceConfig >(config, sizeOut);
		
		IIgnitionConfig *ignitionConfig = 0;
		ignitionConfig = ServiceBuilder::CreateServiceAndOffset<IIgnitionConfig>(IIgnitionConfig::CreateIgnitionConfig, serviceLocator, config, sizeOut);

		IgnitionSchedulingService *ret = new IgnitionSchedulingService(
			ignitionSchedulingConfig,
			ignitionConfig,
			serviceLocator->LocateAndCast<IBooleanOutputService *>(BUILDER_IBOOLEANOUTPUTSERVICEARRAY, INSTANCE_IGNITORS),
			serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
			serviceLocator->LocateAndCast<IReluctor>(BUILDER_IRELUCTOR, INSTANCE_CRANK_RELUCTOR),
			serviceLocator->LocateAndCast<IReluctor>(BUILDER_IRELUCTOR, INSTANCE_CAM_RELUCTOR));
				
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IgnitionSchedulingService::ScheduleEventsCallBack,
			ret);
		
		return ret;
	}

	void *EngineControlServicesServiceBuilderRegister::CreateInjectionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		
		InjectionSchedulingService *ret = new InjectionSchedulingService(
			ServiceBuilder::CastConfigAndOffset < InjectionSchedulingServiceConfig >(config, sizeOut),
			serviceLocator->LocateAndCast<IInjectorTimingService>(BUILDER_IINJECTORTIMINGSERVICE, 0),
			serviceLocator->LocateAndCast<IBooleanOutputService *>(BUILDER_IBOOLEANOUTPUTSERVICEARRAY, INSTANCE_INJECTORS),
			serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
			serviceLocator->LocateAndCast<IReluctor>(BUILDER_IRELUCTOR, INSTANCE_CRANK_RELUCTOR),
			serviceLocator->LocateAndCast<IReluctor>(BUILDER_IRELUCTOR, INSTANCE_CAM_RELUCTOR));
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			InjectionSchedulingService::ScheduleEventsCallBack,
			ret);
		
		return ret;
	}
	
	void EngineControlServicesServiceBuilderRegister::RegisterRpmService(ServiceLocator *serviceLocator)
	{
		RpmService *existing = serviceLocator->LocateAndCast<RpmService>(RPMSERVICE);

		if(existing != 0)
		{
			existing->_crankReluctor = serviceLocator->LocateAndCast<IReluctor>(BUILDER_IRELUCTOR, INSTANCE_CRANK_RELUCTOR);
			existing->_camReluctor = serviceLocator->LocateAndCast<IReluctor>(BUILDER_IRELUCTOR, INSTANCE_CAM_RELUCTOR);
		}
		else
		{
			RpmService *rpmService = new RpmService(
				serviceLocator->LocateAndCast<IReluctor>(BUILDER_IRELUCTOR, INSTANCE_CRANK_RELUCTOR), 
				serviceLocator->LocateAndCast<IReluctor>(BUILDER_IRELUCTOR, INSTANCE_CAM_RELUCTOR));

			serviceLocator->RegisterIfNotNull(RPMSERVICE, rpmService);
			
			serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
				RpmService::TickCallBack,
				rpmService);
		}
	}

	void* EngineControlServicesServiceBuilderRegister::CreateReluctor(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
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