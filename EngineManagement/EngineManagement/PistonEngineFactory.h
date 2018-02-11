#include "PistonEngineDefines.h"
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
#include "PistonEngineInjectionConfigWrapper_DFCO.h"
#include "PistonEngineController.h"
#include "AfrService_Map_Ethanol.h"
#include "EthanolService_Analog.h"
#include "EthanolService_Pwm.h"

namespace EngineManagement
{
	IPistonEngineInjectionConfig* CreatePistonEngineInjectionConfig(
			Decoder::IDecoder *decoder, 
		IFuelTrimService *fuelTrimService, 
		IMapService *mapService, 
		ITpsService *tpsService, 
		IIntakeAirTemperatureService *iatService, 
		IEngineCoolantTemperatureService *ectService, 
		IVoltageService *voltageService, 
		IAfrService *afrService,
		PistonEngineConfig *pistonEngineConfig,
		void *config);
	
	extern HardwareAbstraction::ITimerService *CurrentTimerService;
	extern HardwareAbstraction::IDigitalService *CurrentDigitalService;
	extern HardwareAbstraction::IAnalogService *CurrentAnalogService;
	extern HardwareAbstraction::IPwmService *CurrentPwmService;
	extern PistonEngineController *CurrentPistonEngineController;
	extern Decoder::IDecoder *CurrentDecoder;
	extern IIgnitorService *CurrentIgnitorServices[MAX_CYLINDERS];
	extern IInjectorService *CurrentInjectorServices[MAX_CYLINDERS];
	extern IMapService *CurrentMapService;
	extern IFuelTrimService *CurrentFuelTrimService;
	extern IEngineCoolantTemperatureService *CurrentEngineCoolantTemperatureService;
	extern IIntakeAirTemperatureService *CurrentIntakeAirTemperatureService;
	extern IVoltageService *CurrentVoltageService;
	extern IEthanolService *CurrentEthanolService;
	extern IAfrService *CurrentAfrService;
	extern ITpsService *CurrentThrottlePositionService;
	extern PistonEngineConfig *CurrentPistonEngineConfig;
	extern IPistonEngineInjectionConfig *CurrentPistonEngineInjectionConfig;
	extern IPistonEngineIgnitionConfig *CurrentPistonEngineIgnitionConfig;
	
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
		void *pistonEngineIgnitionConfigFile);
	
	void ScheduleEvents();
}