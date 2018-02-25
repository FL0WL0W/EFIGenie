#include "EthanolService_Static.h"
#include "MapService_Analog.h"
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
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"
#include "PistonEngineIgnitionConfigWrapper_HardRpmLimit.h"
#include "PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit.h"
#include "IgnitorService.h"
#include "IPistonEngineInjectionConfig.h"
#include "PistonEngineInjectionConfig_SD.h"
#include "PistonEngineInjectionConfigWrapper_DFCO.h"
#include "PistonEngineController.h"
#include "EthanolService_Analog.h"
#include "EthanolService_Pwm.h"

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
		);
	
	void ScheduleEvents();
}