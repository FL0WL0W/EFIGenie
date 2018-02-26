#include "ITimerService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
#include "IAnalogService.h"
#include "IPwmService.h"

#include "IIgnitorService.h"
#include "IInjectorService.h"
#include "IMapService.h"
#include "IEthanolService.h"
#include "IIntakeAirTemperatureService.h"
#include "IVoltageService.h"
#include "ITpsService.h"
#include "IDecoder.h"
#include "IFuelTrimService.h"
#include "IPrimeService.h"
#include "IFuelPumpService.h"
#include "IEngineCoolantTemperatureService.h"
#include "ILambdaSensorService.h"
#include "IAfrService.h"

namespace EngineManagement
{
	extern HardwareAbstraction::ITimerService *CurrentTimerService;
	extern HardwareAbstraction::IDigitalService *CurrentDigitalService;
	extern HardwareAbstraction::IAnalogService *CurrentAnalogService;
	extern HardwareAbstraction::IPwmService *CurrentPwmService;
	extern Decoder::IDecoder *CurrentDecoder;
}