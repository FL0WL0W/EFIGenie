#include "IgnitorService.h"
#include "InjectorService.h"
#include "EthanolService_Static.h"
#include "MapService_Analog.h"
#include "EngineCoolantTemperatureService_Static.h"
#include "EngineCoolantTemperatureService_Analog.h"
#include "IntakeAirTemperatureService_Static.h"
#include "IntakeAirTemperatureService_Analog.h"
#include "VoltageService_Static.h"
#include "VoltageService_Analog.h"
#include "TpsService_Analog.h"
#include "AfrService_Static.h"
#include "Gm24xDecoder.h"
#include "PistonEngineConfig.h"
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"
#include "PistonEngineIgnitionConfigWrapper_HardRpmLimit.h"
#include "PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit.h"
#ifndef NOINJECTION
#include "IPistonEngineInjectionConfig.h"
#include "PistonEngineInjectionConfig_SD.h"
#include "PistonEngineInjectionConfigWrapper_DFCO.h"
#endif
#include "PistonEngineController.h"
#include "AfrService_Map_Ethanol.h"
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
#ifndef NOINJECTION
		void *pistonEngineInjectionConfigFile,
#endif
		void *pistonEngineIgnitionConfigFile);
	
	void ScheduleEvents();
}