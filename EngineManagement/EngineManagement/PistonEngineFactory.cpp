#include "Services.h"
#include "PistonEngineFactory.h"

namespace EngineManagement
{
	PistonEngineController *CurrentPistonEngineController;
	PistonEngineConfig *CurrentPistonEngineConfig;
	IPistonEngineIgnitionConfig *CurrentPistonEngineIgnitionConfig;
#ifndef NOINJECTION
	IPistonEngineInjectionConfig *CurrentPistonEngineInjectionConfig;
	
	IPistonEngineInjectionConfig* CreatePistonEngineInjectionConfig(void *config)
	{
		unsigned char pistonEngineInjectionConfigId = *((unsigned char*)config);
		switch (pistonEngineInjectionConfigId)
		{
		case 1:
			return new EngineManagement::PistonEngineInjectionConfig_SD(CurrentPistonEngineConfig, (void*)((unsigned char*)config + 1));
		case 2:
			return new EngineManagement::PistonEngineInjectionConfigWrapper_DFCO((void*)((unsigned char*)config + 1));
		}
		return 0;
	}
#endif
	
	IPistonEngineIgnitionConfig* CreatePistonEngineIgnitionConfig(void *config)
	{
		unsigned char pistonEngineIgnitionConfigId = *((unsigned char*)config);
		switch (pistonEngineIgnitionConfigId)
		{
		case 1:
			return new EngineManagement::PistonEngineIgnitionConfig_Map_Ethanol(CurrentPistonEngineConfig, (void*)((unsigned char*)config + 1));
		case 2:
			return new EngineManagement::PistonEngineIgnitionConfigWrapper_HardRpmLimit((void*)((unsigned char*)config + 1));
		case 3:
			return new EngineManagement::PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit((void*)((unsigned char*)config + 1));
		}
		return 0;
	}
	
	void CreateServices(
		HardwareAbstraction::ITimerService *timerService,
		HardwareAbstraction::IDigitalService *digitalService,
		HardwareAbstraction::IAnalogService *analogService,
		HardwareAbstraction::IPwmService *pwmService,
		void *pistonEngineConfigFile,
		bool ignitionHighZ,
		bool injectorHighZ
#ifndef NOINJECTION
		, bool fuelPumpHighZ
#endif		)
	{
		CurrentTimerService = timerService;
		CurrentDigitalService = digitalService;
		CurrentAnalogService = analogService;
		CurrentPwmService = pwmService;

		
		
		//TODO: create unit tests
		CurrentPistonEngineConfig = new EngineManagement::PistonEngineConfig((void *)((unsigned int*)pistonEngineConfigFile + *((unsigned char*)pistonEngineConfigFile)));

		switch (CurrentPistonEngineConfig->DecoderId)
		{
		case 0:
			CurrentDecoder = new Decoder::Gm24xDecoder(CurrentTimerService);
			break;
		}

		void *ignitorConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 1));
		//TODO: create unit tests
		if(CurrentPistonEngineConfig->IsDistributor)
		{
			//set all to the same pin for distributor
			for(unsigned char cylinder = 0 ; cylinder < CurrentPistonEngineConfig->Cylinders ; cylinder++)
			{
				CurrentIgnitorServices[cylinder] = new EngineManagement::IgnitorService(*((unsigned char*)ignitorConfigFile + cylinder), (bool)((unsigned char*)ignitorConfigFile + CurrentPistonEngineConfig->Cylinders), ignitionHighZ);
			}
		}
		else
		{
			for (unsigned char cylinder = 0; cylinder < CurrentPistonEngineConfig->Cylinders; cylinder++)
			{
				CurrentIgnitorServices[cylinder] = new EngineManagement::IgnitorService(*((unsigned char*)ignitorConfigFile + cylinder), (bool)((unsigned char*)ignitorConfigFile + CurrentPistonEngineConfig->Cylinders), ignitionHighZ);
			}
		}

#ifndef NOINJECTION
		void *injectorConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 2));
		//TODO: create unit tests
		for(unsigned char cylinder = 0 ; cylinder < CurrentPistonEngineConfig->Cylinders ; cylinder++)
		{
			CurrentInjectorServices[cylinder] = new EngineManagement::InjectorService(*((unsigned char*)injectorConfigFile + cylinder), (bool)((unsigned char*)injectorConfigFile + CurrentPistonEngineConfig->Cylinders), injectorHighZ);
		}
#endif

		//TODO: create unit tests
		void *mapConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 3));
		unsigned char mapServiceId = *((unsigned char*)mapConfigFile);
		switch (mapServiceId)
		{
		case 0:
			CurrentMapService = new EngineManagement::MapService_Analog((void *)((unsigned char*)mapConfigFile + 1));
			break;
		}
		
		//TODO: Ceate Unit Tests
		void *ectConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 4));
		unsigned char ectId = *((unsigned char*)ectConfigFile);
		switch (ectId)
		{
		case 0:
			CurrentEngineCoolantTemperatureService = new EngineManagement::EngineCoolantTemperatureService_Static(*((float *)((unsigned char*)ectConfigFile + 1)), *((float *)((unsigned char*)ectConfigFile + 1) + 1));
			break;
		case 1:
			CurrentEngineCoolantTemperatureService = new EngineManagement::EngineCoolantTemperatureService_Analog((void *)((unsigned char*)ectConfigFile + 1));
			break;
		}

		//TODO: Create Unit Tests
		void *iatConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 5));
		unsigned char iatId = *((unsigned char*)iatConfigFile);
		switch (iatId)
		{
		case 0:
			CurrentIntakeAirTemperatureService = new EngineManagement::IntakeAirTemperatureService_Static(*((float *)((unsigned char*)iatConfigFile + 1)), *((float *)((unsigned char*)iatConfigFile + 1) + 1));
			break;
		case 1:
			CurrentIntakeAirTemperatureService = new EngineManagement::IntakeAirTemperatureService_Analog((void *)((unsigned char*)iatConfigFile + 1));
			break;
		}

		//TODO: Create Unit Tests
		void *tpsConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 6));
		unsigned char tpsId = *((unsigned char*)tpsConfigFile);
		switch (tpsId)
		{
		case 0:
			//CurrentThrottlePositionService = new EngineManagement::TpsService_Static(*((float *)((unsigned char*)iatConfigFile + 1)), *((float *)((unsigned char*)iatConfigFile + 1) + 1), *((float *)((unsigned char*)iatConfigFile + 1) + 2));
			break;
		case 1:
			CurrentThrottlePositionService = new EngineManagement::TpsService_Analog((void *)((unsigned char*)tpsConfigFile + 1));
			break;
		}

		//TODO: Create Unit Tests
		void *voltageConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 7));
		unsigned char voltageId = *((unsigned char*)voltageConfigFile);
		switch (voltageId)
		{
		case 0:
			CurrentVoltageService = new EngineManagement::VoltageService_Static(*((float *)((unsigned char*)voltageConfigFile + 1)), *((float *)((unsigned char*)voltageConfigFile + 1) + 1));
			break;
		case 1:
			CurrentVoltageService = new EngineManagement::VoltageService_Analog((void *)((unsigned char*)voltageConfigFile + 1));
			break;
		}

		//TODO: Create Unit Tests
		void *ethanolConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 8));
		unsigned char ethanolServiceId = *((unsigned char*)ethanolConfigFile);
		switch (ethanolServiceId)
		{
		case 0:
			CurrentEthanolService = new EngineManagement::EthanolService_Static(*((float*)((unsigned char*)ethanolConfigFile + 1)));
			break;
		case 1:
			CurrentEthanolService = new EngineManagement::EthanolService_Analog((void*)((unsigned char*)ethanolConfigFile + 1));
			break;
		case 2:
			CurrentEthanolService = new EngineManagement::EthanolService_Pwm((void*)((unsigned char*)ethanolConfigFile + 1));
			break;
		}

#ifndef NOINJECTION
		
		//TODO: Fuel Trim Service
		void *fuelTrimConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 9));
		unsigned char fuelTrimId = *((unsigned char*)fuelTrimConfigFile);
		switch (fuelTrimId)
		{
		case 0:
			CurrentFuelTrimService = 0;
			break;
		}
		
		//TODO: Create Unit Tests
		//AFR Service to use TPS override and ECT for warm up enrichment
		void *afrConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 10));
		unsigned char afrServiceId = *((unsigned char*)afrConfigFile);
		switch (afrServiceId)
		{
		case 0:
			CurrentAfrService = new EngineManagement::AfrService_Static(*((float*)((unsigned char*)afrConfigFile + 1)));
			break;
		case 1:
			CurrentAfrService = new EngineManagement::AfrService_Map_Ethanol((void*)((unsigned char*)afrConfigFile + 1));
			break;
		}

		//TODO: create unit tests
		void *pistonEngineInjectionConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 11));
		CurrentPistonEngineInjectionConfig = CreatePistonEngineInjectionConfig(pistonEngineInjectionConfigFile);
		
		//TODO: create unit test
		void *primeConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 12));
		unsigned char primeServiceId = *((unsigned char*)primeConfigFile);
		switch (primeServiceId)
		{
		case 0:
			CurrentPrimeService = new PrimeService_StaticPulseWidth((void*)((unsigned char*)primeConfigFile + 1));
			break;
		}
		
		//TODO: create unit test
		void *fuelPumpConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 13));
		unsigned char fuelpumpServiceId = *((unsigned char*)fuelPumpConfigFile);
		switch (fuelpumpServiceId)
		{
		case 0:
			CurrentFuelPumpService = new FuelPumpService((void*)((unsigned char*)fuelPumpConfigFile + 1), fuelPumpHighZ);
			break;
		}
#endif
		
		//TODO: create unit tests
		void *pistonEngineIgnitionConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + 14));
		CurrentPistonEngineIgnitionConfig = CreatePistonEngineIgnitionConfig(pistonEngineIgnitionConfigFile);

		//TODO: create unit tests
		//finish odd cylinder banks
		//finish Throttle Body Injection
		CurrentPistonEngineController = new EngineManagement::PistonEngineController(
#ifndef NOINJECTION
			CurrentPistonEngineInjectionConfig, 
#endif
			CurrentPistonEngineIgnitionConfig, CurrentPistonEngineConfig);

#ifndef NOINJECTION
		CurrentFuelPumpService->Prime();
#endif
		
		//wait until the decoder is synced before any scheduling
		while(!CurrentDecoder->IsSynced());

#ifndef NOINJECTION
		CurrentFuelPumpService->On();
#endif
	}

	void ScheduleEvents()
	{
		CurrentMapService->ReadMap();
		CurrentEngineCoolantTemperatureService->ReadEct();
		CurrentIntakeAirTemperatureService->ReadIat();
		CurrentVoltageService->ReadVoltage();
		CurrentEthanolService->ReadEthanolContent();
#ifndef NOINJECTION
		CurrentFuelPumpService->Tick();
		CurrentPrimeService->PrimeTick();
#endif
		CurrentPistonEngineController->ScheduleEvents();
	}
}