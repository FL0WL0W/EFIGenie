#include "ITimerService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
#include "IAnalogService.h"
#include "IPwmService.h"
#include "IIgnitorService.h"
#include "IgnitorService.h"
#include "IInjectorService.h"
#include "InjectorService.h"
#include "IMapService.h"
#include "IEthanolService.h"
#include "EthanolService_Static.h"
#include "MapService_Analog.h"
#include "IEngineCoolantTemperatureService.h"
#include "EngineCoolantTemperatureService_Static.h"
#include "EngineCoolantTemperatureService_Analog.h"
#include "IIntakeAirTemperatureService.h"
#include "IntakeAirTemperatureService_Static.h"
#include "IntakeAirTemperatureService_Analog.h"
#include "IVoltageService.h"
#include "VoltageService_Static.h"
#include "VoltageService_Analog.h"
#include "ITpsService.h"
#include "TpsService_Analog.h"
#include "IAfrService.h"
#include "AfrService_Static.h"
#include "IDecoder.h"
#include "Gm24xDecoder.h"
#include "IFuelTrimService.h"
#include "PistonEngineConfig.h"
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"
#include "IPistonEngineInjectionConfig.h"
#include "PistonEngineInjectionConfig_SD.h"
#include "PistonEngineController.h"
#include "AfrService_Map_Ethanol.h"
#include "EthanolService_Analog.h"
#include "EthanolService_Pwm.h"

namespace EngineManagement
{
	HardwareAbstraction::ITimerService *CurrentTimerService;
	HardwareAbstraction::IDigitalService *CurrentDigitalService;
	HardwareAbstraction::IAnalogService *CurrentAnalogService;
	HardwareAbstraction::IPwmService *CurrentPwmService;
	PistonEngineController *CurrentPistonEngineController;
	Decoder::IDecoder *CurrentDecoder;
	IIgnitorService *CurrentIgnitorServices[MAX_CYLINDERS];
	IInjectorService *CurrentInjectorServices[MAX_CYLINDERS];
	IMapService *CurrentMapService;
	IFuelTrimService *CurrentFuelTrimService;
	IEngineCoolantTemperatureService *CurrentEngineCoolantTemperatureService;
	IIntakeAirTemperatureService *CurrentIntakeAirTemperatureService;
	IVoltageService *CurrentVoltageService;
	IEthanolService *CurrentEthanolService;
	IAfrService *CurrentAfrService;
	ITpsService *CurrentThrottlePositionService;
	PistonEngineConfig *CurrentPistonEngineConfig;
	IPistonEngineInjectionConfig *CurrentPistonEngineInjectionConfig;
	IPistonEngineIgnitionConfig *CurrentPistonEngineIgnitionConfig;
	
	void CreateServices(
		HardwareAbstraction::ITimerService *timerService,
		HardwareAbstraction::IDigitalService *digitalService,
		HardwareAbstraction::IAnalogService *analogService,
		HardwareAbstraction::IPwmService *pwmService,
		void *pistonEngineConfigFile,
		unsigned char ignitionPins[MAX_CYLINDERS],
		bool ignitionNormalOn,
		bool ignitionHighZ,
		unsigned char injectorPins[MAX_CYLINDERS],
		bool injectorNormalOn,
		bool injectorHighZ,
		unsigned char mapPin,
		void *mapConfigFile,
		unsigned char ectPin,
		void *ectConfigFile,
		unsigned char iatPin,
		void *iatConfigFile,
		unsigned char voltagePin,
		void *tpsConfigFile,
		unsigned char tpsPin,
		void *voltageConfigFile,
		unsigned char ethanolPin,
		void *ethanolConfigFile,
		void *fuelTrimConfigFile,
		void *afrConfigFile,
		void *pistonEngineInjectionConfigFile,
		void *pistonEngineIgnitionConfigFile)
	{
		CurrentTimerService = timerService;
		CurrentDigitalService = digitalService;
		CurrentAnalogService = analogService;
		CurrentPwmService = CurrentPwmService;

		//TODO: create unit tests
		CurrentPistonEngineConfig = new EngineManagement::PistonEngineConfig(pistonEngineConfigFile);

		switch (CurrentPistonEngineConfig->DecoderId)
		{
		case 0:
			CurrentDecoder = new Decoder::Gm24xDecoder(CurrentTimerService);
			break;
		}

		//TODO: create unit tests
		if (CurrentPistonEngineConfig->IsDistributor)
		{
			//set all to the same pin for distributor
			for (unsigned char cylinder = 0; cylinder < CurrentPistonEngineConfig->Cylinders; cylinder++)
			{
				CurrentIgnitorServices[cylinder] = new EngineManagement::IgnitorService(CurrentDigitalService, ignitionPins[cylinder], ignitionNormalOn, ignitionHighZ);
			}
		}
		else
		{
			for (unsigned char cylinder = 0; cylinder < CurrentPistonEngineConfig->Cylinders; cylinder++)
			{
				CurrentIgnitorServices[cylinder] = new EngineManagement::IgnitorService(CurrentDigitalService, ignitionPins[0], ignitionNormalOn, ignitionHighZ);
			}
		}

		//TODO: create unit tests
		for (unsigned char cylinder = 0; cylinder < CurrentPistonEngineConfig->Cylinders; cylinder++)
		{
			CurrentInjectorServices[cylinder] = new EngineManagement::InjectorService(CurrentDigitalService, injectorPins[cylinder], injectorNormalOn, injectorHighZ);
		}

		//TODO: create unit tests
		unsigned char mapServiceId = *((unsigned char*)mapConfigFile);
		switch (mapServiceId)
		{
		case 0:
			CurrentMapService = new EngineManagement::MapService_Analog(CurrentTimerService, CurrentAnalogService, mapPin, ((void *)((unsigned char*)mapConfigFile + 1)));
			break;
		}
		
		//TODO: Ceate Unit Tests
		unsigned char ectId = *((unsigned char*)ectConfigFile);
		switch (ectId)
		{
		case 0:
			CurrentEngineCoolantTemperatureService = new EngineManagement::EngineCoolantTemperatureService_Static(*((float *)((unsigned char*)ectConfigFile + 1)), *((float *)((unsigned char*)ectConfigFile + 1) + 1));
			break;
		case 1:
			CurrentEngineCoolantTemperatureService = new EngineManagement::EngineCoolantTemperatureService_Analog(CurrentTimerService, CurrentAnalogService, ectPin, ((void *)((unsigned char*)ectConfigFile + 1)));
			break;
		}

		//TODO: Create Unit Tests
		unsigned char iatId = *((unsigned char*)iatConfigFile);
		switch (iatId)
		{
		case 0:
			CurrentIntakeAirTemperatureService = new EngineManagement::IntakeAirTemperatureService_Static(*((float *)((unsigned char*)iatConfigFile + 1)), *((float *)((unsigned char*)iatConfigFile + 1) + 1));
			break;
		case 1:
			CurrentIntakeAirTemperatureService = new EngineManagement::IntakeAirTemperatureService_Analog(CurrentTimerService, CurrentAnalogService, iatPin, ((void *)((unsigned char*)iatConfigFile + 1)));
			break;
		}

		//TODO: Create Unit Tests
		unsigned char tpsId = *((unsigned char*)tpsConfigFile);
		switch (tpsId)
		{
		case 0:
			//CurrentThrottlePositionService = new EngineManagement::TpsService_Static(*((float *)((unsigned char*)iatConfigFile + 1)), *((float *)((unsigned char*)iatConfigFile + 1) + 1), *((float *)((unsigned char*)iatConfigFile + 1) + 2));
			break;
		case 1:
			CurrentThrottlePositionService = new EngineManagement::TpsService_Analog(CurrentTimerService, CurrentAnalogService, iatPin, ((void *)((unsigned char*)tpsConfigFile + 1)));
			break;
		}

		//TODO: Create Unit Tests
		unsigned char voltageId = *((unsigned char*)voltageConfigFile);
		switch (voltageId)
		{
		case 0:
			CurrentVoltageService = new EngineManagement::VoltageService_Static(*((float *)((unsigned char*)voltageConfigFile + 1)), *((float *)((unsigned char*)voltageConfigFile + 1) + 1));
			break;
		case 1:
			CurrentVoltageService = new EngineManagement::VoltageService_Analog(CurrentTimerService, CurrentAnalogService, voltagePin, ((void *)((unsigned char*)voltageConfigFile + 1)));
			break;
		}

		//TODO: Create Unit Tests
		unsigned char ethanolServiceId = *((unsigned char*)ethanolConfigFile);
		switch (ethanolServiceId)
		{
		case 0:
			CurrentEthanolService = new EngineManagement::EthanolService_Static(*((float*)((unsigned char*)ethanolConfigFile + 1)));
			break;
		case 1:
			CurrentEthanolService = new EngineManagement::EthanolService_Analog(CurrentAnalogService, ethanolPin, (void*)((unsigned char*)ethanolConfigFile + 1));
			break;
		case 2:
			CurrentEthanolService = new EngineManagement::EthanolService_Pwm(CurrentPwmService, ethanolPin, (void*)((unsigned char*)ethanolConfigFile + 1));
			break;
		}

		//TODO: Create TPS Service

		//TODO: Fuel Trim Service
		unsigned char fuelTrimId = *((unsigned char*)fuelTrimConfigFile);
		switch (fuelTrimId)
		{
		case 0:
			CurrentFuelTrimService = NULL;
			break;
		}

		//TODO: Create Unit Tests
		//AFR Service to use TPS override and ECT for warm up enrichment
		unsigned char afrServiceId = *((unsigned char*)afrConfigFile);
		switch (afrServiceId)
		{
		case 0:
			CurrentAfrService = new EngineManagement::AfrService_Static(*((float*)((unsigned char*)afrConfigFile + 1)));
			break;
		case 1:
			CurrentAfrService = new EngineManagement::AfrService_Map_Ethanol(CurrentDecoder, CurrentPistonEngineConfig, CurrentMapService, CurrentEthanolService, (void*)((unsigned char*)afrConfigFile + 1));
			break;
		}

		//TODO: create unit tests
		//Use TPS for "Acceleration Enrichment"
		unsigned char pistonEngineInjectionConfigId = *((unsigned char*)pistonEngineInjectionConfigFile);
		switch (pistonEngineInjectionConfigId)
		{
		case 1:
			CurrentPistonEngineInjectionConfig = new EngineManagement::PistonEngineInjectionConfig_SD(CurrentDecoder, CurrentFuelTrimService, CurrentMapService, CurrentIntakeAirTemperatureService, CurrentEngineCoolantTemperatureService, CurrentVoltageService, CurrentAfrService, CurrentPistonEngineConfig, (void*)((unsigned char*)pistonEngineInjectionConfigFile + 1));
			break;
		}

		//TODO: create unit tests
		unsigned char pistonEngineIgnitionConfigId = *((unsigned char*)pistonEngineIgnitionConfigFile);
		switch (pistonEngineIgnitionConfigId)
		{
		case 1:
			CurrentPistonEngineIgnitionConfig = new EngineManagement::PistonEngineIgnitionConfig_Map_Ethanol(CurrentDecoder, CurrentMapService, CurrentEthanolService, CurrentIntakeAirTemperatureService, CurrentEngineCoolantTemperatureService, CurrentVoltageService, CurrentAfrService, CurrentPistonEngineConfig, (void*)((unsigned char*)pistonEngineIgnitionConfigFile + 1));
			break;
		}

		//TODO: create unit tests
		//finish odd cylinder banks
		//finish Throttle Body Injection
		CurrentPistonEngineController = new EngineManagement::PistonEngineController(CurrentTimerService, CurrentDecoder, CurrentIgnitorServices, CurrentInjectorServices, CurrentPistonEngineInjectionConfig, CurrentPistonEngineIgnitionConfig, CurrentPistonEngineConfig);

		//wait until the decoder is synced before any scheduling
		while (!CurrentDecoder->IsSynced());

		//TODO: Create Fuel Prime
	}

	void ScheduleEvents()
	{
		CurrentMapService->ReadMap();
		CurrentEngineCoolantTemperatureService->ReadEct();
		CurrentIntakeAirTemperatureService->ReadIat();
		CurrentVoltageService->ReadVoltage();
		CurrentEthanolService->ReadEthanolContent();
		CurrentPistonEngineController->ScheduleEvents();
	}
}