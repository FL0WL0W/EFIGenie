#include "ITimerService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
#include "IAnalogService.h"
#include "IPwmService.h"
#include "IIgnitorService.h"
#include "IInjectorService.h"
#include "IMapService.h"
#include "IEthanolService.h"
#include "IEngineCoolantTemperatureService.h"
#include "IIntakeAirTemperatureService.h"
#include "IVoltageService.h"
#include "ITpsService.h"
#include "IAfrService.h"
#include "IDecoder.h"
#include "IFuelTrimService.h"

namespace EngineManagement
{
	extern HardwareAbstraction::ITimerService *CurrentTimerService;
	extern HardwareAbstraction::IDigitalService *CurrentDigitalService;
	extern HardwareAbstraction::IAnalogService *CurrentAnalogService;
	extern HardwareAbstraction::IPwmService *CurrentPwmService;
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
}