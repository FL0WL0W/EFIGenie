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
#include "PrimeService_StaticPulseWidth.h"
#include "InjectorService.h"
#include "FuelPumpService.h"
#ifndef NOIGNITION
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"
#include "PistonEngineIgnitionConfigWrapper_HardRpmLimit.h"
#include "PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit.h"
#include "IgnitorService.h"
#endif
#ifndef NOINJECTION
#include "AfrService_Static.h"
#include "AfrService_Map_Ethanol.h"
#include "IPistonEngineInjectionConfig.h"
#include "PistonEngineInjectionConfig_SD.h"
#include "PistonEngineInjectionConfigWrapper_DFCO.h"
#endif
#if !defined(NOINJECTION ) && !defined(NOIGNITION )
#include "PistonEngineController.h"
#endif
#include "EthanolService_Analog.h"
#include "EthanolService_Pwm.h"

namespace EngineManagement
{
#ifndef NOINJECTION
	extern IPistonEngineInjectionConfig *CurrentPistonEngineInjectionConfig;
	
	IPistonEngineInjectionConfig* CreatePistonEngineInjectionConfig(void *config);
#endif
#ifndef NOIGNITION
	extern IPistonEngineIgnitionConfig *CurrentPistonEngineIgnitionConfig;
	
	IPistonEngineIgnitionConfig* CreatePistonEngineIgnitionConfig(void *config);
#endif
#if !defined(NOINJECTION ) && !defined(NOIGNITION )
	extern PistonEngineController *CurrentPistonEngineController;
#endif
	extern PistonEngineConfig *CurrentPistonEngineConfig;

	void CreateServices(
		HardwareAbstraction::ITimerService *timerService,
		HardwareAbstraction::IDigitalService *digitalService,
		HardwareAbstraction::IAnalogService *analogService,
		HardwareAbstraction::IPwmService *pwmService,
		void *pistonEngineConfigFile,
#ifndef NOIGNITION
		bool ignitionHighZ,
#endif
		bool injectorHighZ,
		bool fuelPumpHighZ);
	
	void ScheduleEvents();
}