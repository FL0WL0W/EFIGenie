#include "ITimerService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
#include "IAnalogService.h"
#include "IPwmService.h"
#ifndef NOIGNITION
#include "IIgnitorService.h"
#endif
#include "IMapService.h"
#include "IEthanolService.h"
#include "IEngineCoolantTemperatureService.h"
#include "IIntakeAirTemperatureService.h"
#include "IVoltageService.h"
#include "ITpsService.h"
#include "IDecoder.h"
#include "IInjectorService.h"
#ifndef NOINJECTION
#include "IAfrService.h"
#include "IFuelTrimService.h"
#endif
#include "IPrimeService.h"
#include "IFuelPumpService.h"

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
#ifndef NOIGNITION
	extern IIgnitorService *CurrentIgnitorServices[MAX_CYLINDERS];
#endif
	extern IMapService *CurrentMapService;
	extern IEngineCoolantTemperatureService *CurrentEngineCoolantTemperatureService;
	extern IIntakeAirTemperatureService *CurrentIntakeAirTemperatureService;
	extern IVoltageService *CurrentVoltageService;
	extern IEthanolService *CurrentEthanolService;
	extern ITpsService *CurrentThrottlePositionService;
#ifndef NOINJECTION
	extern IAfrService *CurrentAfrService;
	extern IFuelTrimService *CurrentFuelTrimService;
#endif
	extern IInjectorService *CurrentInjectorServices[MAX_CYLINDERS];
	extern IPrimeService *CurrentPrimeService;
	extern IFuelPumpService *CurrentFuelPumpService;
}