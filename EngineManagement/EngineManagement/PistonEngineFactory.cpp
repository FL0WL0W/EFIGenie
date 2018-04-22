#ifdef PISTONENGINEFACTORY_H
namespace EngineManagement
{		
	void CreateServices(
			HardwareAbstraction::ITimerService *timerService,
		HardwareAbstraction::IDigitalService *digitalService,
		HardwareAbstraction::IAnalogService *analogService,
		HardwareAbstraction::IPwmService *pwmService,
		void *pistonEngineConfigFile
#ifdef IPISTONENGINEIGNITIONCONFIG_H
		, bool ignitionHighZ
#endif
#ifdef IPISTONENGINEINJECTIONCONFIG_H
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
		unsigned char fileSystemPointer = 0;

		CurrentPistonEngineConfig = new EngineManagement::PistonEngineConfig((void *)((unsigned int*)pistonEngineConfigFile + *((unsigned char*)pistonEngineConfigFile)));

		switch (CurrentPistonEngineConfig->DecoderId)
		{
		case 0:
			CurrentDecoder = new Decoder::Gm24xDecoder(CurrentTimerService);
			break;
		}
		
		fileSystemPointer++;
#ifdef IPISTONENGINEIGNITIONCONFIG_H
		void *ignitorConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		if(CurrentPistonEngineConfig->IsDistributor)
		{
			//set all to the same pin for distributor
			for(unsigned char cylinder = 0 ; cylinder < CurrentPistonEngineConfig->Cylinders ; cylinder++)
			{
				CurrentIgnitorServices[cylinder] = new EngineManagement::IgnitorService(*((unsigned char*)ignitorConfigFile), (bool)((unsigned char*)ignitorConfigFile + 1), ignitionHighZ);
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
#ifdef IPISTONENGINEINJECTIONCONFIG_H
		void *injectorConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		for(unsigned char cylinder = 0 ; cylinder < CurrentPistonEngineConfig->Cylinders ; cylinder++)
		{
			CurrentInjectorServices[cylinder] = new EngineManagement::InjectorService(*((unsigned char*)injectorConfigFile + cylinder), (bool)((unsigned char*)injectorConfigFile + CurrentPistonEngineConfig->Cylinders), injectorHighZ);
		}
#endif

		void *mapConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer++));
		CurrentManifoldAbsolutePressureService = CreateSensorService(mapConfigFile);
		
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
#ifdef IAfrServiceExists
		void *afrConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentAfrService = CreateAfrService(afrConfigFile);
#endif
		
		fileSystemPointer++;
#ifdef IFuelTrimServiceExists
		void *fuelTrimConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentFuelTrimService = CreateFuelTrimService(fuelTrimConfigFile);
#endif
		
		fileSystemPointer++;
#ifdef IFuelPumpServiceExists
		void *fuelPumpConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentFuelPumpService = CreateFuelPumpService(fuelPumpConfigFile, fuelPumpHighZ);
#endif
		
		fileSystemPointer++;
#ifdef IPrimeServiceExists
		void *primeConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentPrimeService = CreatePrimeService(primeConfigFile);
#endif
		
		fileSystemPointer++;
#ifdef IIdleAirControlValveServiceExists
		void *idleAirValveConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentIdleAirControlValveService = CreateIdleAirControlValveService(idleAirValveConfigFile);
#endif 
		
		fileSystemPointer++;
#ifdef IIdleControlServiceExists
		void *idleConfigFile = (void *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer));
		CurrentIdleControlService = CreateIdleControlService(idleConfigFile);
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
		if (CurrentFuelPumpService != 0)
			CurrentFuelPumpService->Prime();
#endif
		
		//wait until the decoder is synced before any scheduling
		while(!CurrentDecoder->IsSynced());
		
		//create tachometer service to start after the cam is synced
		fileSystemPointer++;
#ifdef TachometerServiceExists
		CurrentTachometerService = new TachometerService((TachometerServiceConfig *)((unsigned char*)pistonEngineConfigFile + *((unsigned int*)pistonEngineConfigFile + fileSystemPointer)), tachometerHighZ);		  
#endif 
		
#ifdef IPrimeServiceExists
		CurrentPrimeService->Prime();
#endif
		
#ifdef IFuelPumpServiceExists
		if (CurrentFuelPumpService != 0)
			CurrentFuelPumpService->On();
#endif
	}

	void ScheduleEvents()
	{
		if (CurrentManifoldAbsolutePressureService != 0)
			CurrentManifoldAbsolutePressureService->ReadValue();
		
		if (CurrentEngineCoolantTemperatureService != 0)
			CurrentEngineCoolantTemperatureService->ReadValue();
		
		if (CurrentIntakeAirTemperatureService != 0)
			CurrentIntakeAirTemperatureService->ReadValue();

		if (CurrentVoltageService != 0)
		CurrentVoltageService->ReadValue();
		
		if (CurrentEthanolContentService != 0)
			CurrentEthanolContentService->ReadValue();

#ifdef IAfrServiceExists
		if (CurrentAfrService != 0)
			CurrentAfrService->CalculateAfr();
#endif
		
#ifdef IFuelPumpServiceExists
		if (CurrentFuelPumpService != 0)
			CurrentFuelPumpService->Tick();
#endif
		
#ifdef IPrimeServiceExists
		if (CurrentPrimeService != 0)
			CurrentPrimeService->Tick();
#endif
		
#ifdef IIdleControlServiceExists
		if (CurrentIdleControlService != 0)
			CurrentIdleControlService->Tick();
#endif 
		
#ifdef PistonEngineControllerExists
		CurrentPistonEngineController->ScheduleEvents();
#endif
	}
}
#endif