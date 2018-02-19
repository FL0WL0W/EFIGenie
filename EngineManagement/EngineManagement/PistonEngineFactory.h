#include "IgnitorService.h"
#include "EthanolService_Static.h"
#include "MapService_Analog.h"
#include "EngineCoolantTemperatureService_Static.h"
#include "EngineCoolantTemperatureService_Analog.h"
#include "IntakeAirTemperatureService_Static.h"
#include "IntakeAirTemperatureService_Analog.h"
#include "VoltageService_Static.h"
#include "VoltageService_Analog.h"
#include "TpsService_Analog.h"
#include "Gm24xDecoder.h"
#include "PistonEngineConfig.h"
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"
#include "PistonEngineIgnitionConfigWrapper_HardRpmLimit.h"
#include "PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit.h"
#ifndef NOINJECTION
#include "AfrService_Static.h"
#include "AfrService_Map_Ethanol.h"
#include "InjectorService.h"
#include "IPistonEngineInjectionConfig.h"
#include "PistonEngineInjectionConfig_SD.h"
#include "PistonEngineInjectionConfigWrapper_DFCO.h"
#include "PrimeService_StaticPulseWidth.h"
#include "FuelPumpService.h"
#endif
#include "PistonEngineController.h"
#include "EthanolService_Analog.h"
#include "EthanolService_Pwm.h"

namespace EngineManagement
{
#ifndef NOINJECTION
	extern IPistonEngineInjectionConfig *CurrentPistonEngineInjectionConfig;
	
	IPistonEngineInjectionConfig* CreatePistonEngineInjectionConfig(void *config);
#endif
	
	extern IPistonEngineIgnitionConfig *CurrentPistonEngineIgnitionConfig;
	
	IPistonEngineIgnitionConfig* CreatePistonEngineIgnitionConfig(void *config);
	
	extern PistonEngineController *CurrentPistonEngineController;
	extern PistonEngineConfig *CurrentPistonEngineConfig;

#ifndef NOINJECTION
	void CreateServices(
		HardwareAbstraction::ITimerService *timerService,
		HardwareAbstraction::IDigitalService *digitalService,
		HardwareAbstraction::IAnalogService *analogService,
		HardwareAbstraction::IPwmService *pwmService,
		void *pistonEngineConfigFile,
		bool ignitionHighZ,
		bool injectorHighZ,
		bool fuelPumpHighZ);
#else
	void CreateServices(
		HardwareAbstraction::ITimerService *timerService,
		HardwareAbstraction::IDigitalService *digitalService,
		HardwareAbstraction::IAnalogService *analogService,
		HardwareAbstraction::IPwmService *pwmService,
		void *pistonEngineConfigFile,
		bool ignitionHighZ);
#endif
	
	void ScheduleEvents();
}