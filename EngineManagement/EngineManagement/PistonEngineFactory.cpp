#include "Services.h"
#include "PistonEngineFactory.h"

namespace EngineManagement
{		
	void CreateServices(
			HardwareAbstraction::ITimerService *timerService,
		HardwareAbstraction::IDigitalService *digitalService,
		HardwareAbstraction::IAnalogService *analogService,
		HardwareAbstraction::IPwmService *pwmService,
		void *pistonEngineConfigFile,
#ifdef IIgnitorServiceExists
		bool ignitionHighZ,
#endif
#ifdef IInjectorServiceExists
		bool injectorHighZ,
#endif
#ifdef IFuelPumpServiceExists
		bool fuelPumpHighZ
#endif
		)
	{
		CurrentTimerService = timerService;
		CurrentDigitalService = digitalService;
		CurrentAnalogService = analogService;
		CurrentPwmService = pwmService;
		
		unsigned char fileSystemPointer = 0;

		CurrentPistonEngineConfig = new EngineManagement::PistonEngineConfig((void *)((unsigned int*)pistonEngineConfigFile + *((unsigned char*)pistonEngineConfigFile)));

		switch (CurrentPistonEngineConfig->DecoderId)
		{
		case 0:
			CurrentDecoder = new Decoder::Gm24xDecoder(CurrentTimerService);
			break;
		}
		
#ifdef IIgnitorServiceExists
		void *ignitorConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
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
#endif
#ifdef IInjectorServiceExists
		void *injectorConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		for(unsigned char cylinder = 0 ; cylinder < CurrentPistonEngineConfig->Cylinders ; cylinder++)
		{
			CurrentInjectorServices[cylinder] = new EngineManagement::InjectorService(*((unsigned char*)injectorConfigFile + cylinder), (bool)((unsigned char*)injectorConfigFile + CurrentPistonEngineConfig->Cylinders), injectorHighZ);
		}
#endif

#ifdef IMapServiceExists
		void *mapConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentMapService = CreateMapService(mapConfigFile);
#endif
		
#ifdef IEngineCoolantTemperatureServiceExists
		void *ectConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentEngineCoolantTemperatureService = CreateEngineCoolantTemperatureService(ectConfigFile);
#endif

#ifdef IIntakeAirTemperatureServiceExists
		void *iatConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentIntakeAirTemperatureService = CreateIntakeAirTemperatureService(iatConfigFile);
#endif
		
#ifdef ITpsServiceExists
		void *tpsConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentThrottlePositionService = CreateThrottlePositionService(tpsConfigFile);
#endif
		
#ifdef IVoltageServiceExists
		void *voltageConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentVoltageService = CreateVoltageService(voltageConfigFile);
#endif
		
#ifdef IEthanolServiceExists
		void *ethanolConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentEthanolService = CreateEthanolService(ethanolConfigFile);
#endif

#ifdef IFuelTrimServiceExists
		//TODO: Fuel Trim Service
		void *fuelTrimConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentFuelTrimService = CreateFuelTrimService(fuelTrimConfigFile);
#endif
		
#ifdef IAfrServiceExists
		void *afrConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentAfrService = CreateAfrService(afrConfigFile);
#endif
		
#ifdef IFuelPumpServiceExists
		void *fuelPumpConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentFuelPumpService = CreateFuelPumpService(fuelPumpConfigFile, fuelPumpHighZ);
#endif
		
#ifdef IPrimeServiceExists
		void *primeConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
#endif

#ifdef IPistonEngineInjectionConfigExists
		//TODO: create unit tests
		void *pistonEngineInjectionConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentPistonEngineInjectionConfig = CreatePistonEngineInjectionConfig(pistonEngineInjectionConfigFile);
#endif

#ifdef IPistonEngineIgnitionConfigExists
		//TODO: create unit tests
		void *pistonEngineIgnitionConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentPistonEngineIgnitionConfig = CreatePistonEngineIgnitionConfig(pistonEngineIgnitionConfigFile);
#endif

#ifdef PistonEngineControllerExists
		//TODO: create unit tests
		//finish odd cylinder banks
		//finish Throttle Body Injection
		CurrentPistonEngineController = new EngineManagement::PistonEngineController();
#endif

#ifdef IFuelPumpServiceExists
		CurrentFuelPumpService->Prime();
#endif
		
		//wait until the decoder is synced before any scheduling
		while(!CurrentDecoder->IsSynced());

#ifdef IPrimeServiceExists
		CurrentPrimeService->Prime();
#endif
		
#ifdef IFuelPumpServiceExists
		CurrentFuelPumpService->On();
#endif
	}

	void ScheduleEvents()
	{
#ifdef IMapServiceExists
		CurrentMapService->ReadMap();
#endif
#ifdef IEngineCoolantTemperatureServiceExists
		CurrentEngineCoolantTemperatureService->ReadEct();
#endif
#ifdef IIntakeAirTemperatureServiceExists
		CurrentIntakeAirTemperatureService->ReadIat();
#endif
#ifdef IVoltageServiceExists
		CurrentVoltageService->ReadVoltage();
#endif
#ifdef IEthanolServiceExists
		CurrentEthanolService->ReadEthanolContent();
#endif
#ifdef IFuelPumpServiceExists
		CurrentFuelPumpService->Tick();
#endif
#ifdef IAfrServiceExists
		CurrentAfrService->CalculateAfr();
#endif
#ifdef IPrimeServiceExists
		CurrentPrimeService->Tick();
#endif
#ifdef PistonEngineControllerExists
		CurrentPistonEngineController->ScheduleEvents();
#endif
	}
}