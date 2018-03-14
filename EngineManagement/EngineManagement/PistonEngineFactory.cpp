#include "Services.h"
#include "PistonEngineFactory.h"

namespace EngineManagement
{		
	void CreateServices(
			HardwareAbstraction::ITimerService *timerService,
		HardwareAbstraction::IDigitalService *digitalService,
		HardwareAbstraction::IAnalogService *analogService,
		HardwareAbstraction::IPwmService *pwmService,
		void *pistonEngineConfigFile
#ifdef IIgnitorServiceExists
		, bool ignitionHighZ
#endif
#ifdef IInjectorServiceExists
		, bool injectorHighZ
#endif
#ifdef IFuelPumpServiceExists
		, bool fuelPumpHighZ
#endif
#ifdef TachometerServiceExists
		, bool tachometerHighZ
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
		
		fileSystemPointer++;
#ifdef IIgnitorServiceExists
		void *ignitorConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
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
		fileSystemPointer++;
#ifdef IInjectorServiceExists
		void *injectorConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		for(unsigned char cylinder = 0 ; cylinder < CurrentPistonEngineConfig->Cylinders ; cylinder++)
		{
			CurrentInjectorServices[cylinder] = new EngineManagement::InjectorService(*((unsigned char*)injectorConfigFile + cylinder), (bool)((unsigned char*)injectorConfigFile + CurrentPistonEngineConfig->Cylinders), injectorHighZ);
		}
#endif

		void *mapConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentManifoldAirPressureService = CreateSensorService(mapConfigFile);
		
		void *ectConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentEngineCoolantTemperatureService = CreateSensorService(ectConfigFile);

		void *iatConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentIntakeAirTemperatureService = CreateSensorService(iatConfigFile);
		
		void *tpsConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentThrottlePositionService = CreateSensorService(tpsConfigFile);
		
		void *voltageConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentVoltageService = CreateSensorService(voltageConfigFile);
		
		void *ethanolConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentEthanolContentService = CreateSensorService(ethanolConfigFile);
		
		void *vssConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentVehicleSpeedSensorService = CreateSensorService(vssConfigFile);

		fileSystemPointer++;
#ifdef IFuelTrimServiceExists
		void *fuelTrimConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentFuelTrimService = CreateFuelTrimService(fuelTrimConfigFile);
#endif
		
		fileSystemPointer++;
#ifdef IAfrServiceExists
		void *afrConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentAfrService = CreateAfrService(afrConfigFile);
#endif
		
		fileSystemPointer++;
#ifdef IFuelPumpServiceExists
		void *fuelPumpConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentFuelPumpService = CreateFuelPumpService(fuelPumpConfigFile, fuelPumpHighZ);
#endif
		
		fileSystemPointer++;
#ifdef IPrimeServiceExists
		void *primeConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
#endif

		fileSystemPointer++;
#ifdef IPistonEngineInjectionConfigExists
		void *pistonEngineInjectionConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentPistonEngineInjectionConfig = CreatePistonEngineInjectionConfig(pistonEngineInjectionConfigFile);
#endif

		fileSystemPointer++;
#ifdef IPistonEngineIgnitionConfigExists
		void *pistonEngineIgnitionConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentPistonEngineIgnitionConfig = CreatePistonEngineIgnitionConfig(pistonEngineIgnitionConfigFile);
#endif

#ifdef PistonEngineControllerExists
		//TODO:
		//finish odd cylinder banks
		//finish Throttle Body Injection
		CurrentPistonEngineController = new EngineManagement::PistonEngineController();
#endif

#ifdef IFuelPumpServiceExists
		CurrentFuelPumpService->Prime();
#endif
		
		//wait until the decoder is synced before any scheduling
		while(!CurrentDecoder->IsSynced());

		//create tachometer service to start after the cam is synced
		fileSystemPointer++;
#ifdef TachometerServiceExists
		CurrentTachometerService = new TachometerService((void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer)), tachometerHighZ);		  
#endif 

		
#ifdef IPrimeServiceExists
		CurrentPrimeService->Prime();
#endif
		
#ifdef IFuelPumpServiceExists
		CurrentFuelPumpService->On();
#endif
	}

	void ScheduleEvents()
	{
		if (CurrentManifoldAirPressureService != 0)
			CurrentManifoldAirPressureService->ReadValue();
		
		if (CurrentEngineCoolantTemperatureService != 0)
			CurrentEngineCoolantTemperatureService->ReadValue();
		
		if (CurrentIntakeAirTemperatureService != 0)
			CurrentIntakeAirTemperatureService->ReadValue();

		if (CurrentVoltageService != 0)
		CurrentVoltageService->ReadValue();
		
		if (CurrentEthanolContentService != 0)
			CurrentEthanolContentService->ReadValue();

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