#include "ITimerService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
#include "IAnalogService.h"
#include "IPwmService.h"
#include "IIgnitorService.h"
#include "IMapService.h"
#include "IEthanolService.h"
#include "IEngineCoolantTemperatureService.h"
#include "IIntakeAirTemperatureService.h"
#include "IVoltageService.h"
#include "ITpsService.h"
#include "IDecoder.h"
#ifndef NOINJECTION
#include "IInjectorService.h"
#include "IAfrService.h"
#include "IFuelTrimService.h"
#include "IPrimeService.h"
#include "IFuelPumpService.h"
#endif

#define INJECTOR_TASK_PRIORITY 1 //needs to be accurate but not as accurate as spark
#define IGNITION_FIRE_TASK_PRIORITY 0 // needs to be accurate
#define IGNITION_DWELL_TASK_PRIORITY 2 // needs to be close

namespace EngineManagement
{
	extern HardwareAbstraction::ITimerService *CurrentTimerService;
	extern HardwareAbstraction::IDigitalService *CurrentDigitalService;
	extern HardwareAbstraction::IAnalogService *CurrentAnalogService;
	extern HardwareAbstraction::IPwmService *CurrentPwmService;
	extern Decoder::IDecoder *CurrentDecoder;
	extern IIgnitorService *CurrentIgnitorServices[MAX_CYLINDERS];
	extern IMapService *CurrentMapService;
	extern IEngineCoolantTemperatureService *CurrentEngineCoolantTemperatureService;
	extern IIntakeAirTemperatureService *CurrentIntakeAirTemperatureService;
	extern IVoltageService *CurrentVoltageService;
	extern IEthanolService *CurrentEthanolService;
	extern ITpsService *CurrentThrottlePositionService;
#ifndef NOINJECTION
	extern IAfrService *CurrentAfrService;
	extern IFuelTrimService *CurrentFuelTrimService;
	extern IInjectorService *CurrentInjectorServices[MAX_CYLINDERS];
	extern IPrimeService *CurrentPrimeService;
	extern IFuelPumpService *CurrentFuelPumpService;
#endif
}