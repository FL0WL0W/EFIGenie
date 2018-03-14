#include "ITimerService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
#include "IAnalogService.h"
#include "IPwmService.h"

#include "IIgnitorService.h"
#include "IInjectorService.h"
#include "ISensorService.h"
#include "IDecoder.h"
#include "IFuelTrimService.h"
#include "IPrimeService.h"
#include "IFuelPumpService.h"
#include "IAfrService.h"
#include "TachometerService.h"

namespace EngineManagement
{
	extern HardwareAbstraction::ITimerService *CurrentTimerService;
	extern HardwareAbstraction::IDigitalService *CurrentDigitalService;
	extern HardwareAbstraction::IAnalogService *CurrentAnalogService;
	extern HardwareAbstraction::IPwmService *CurrentPwmService;
	extern Decoder::IDecoder *CurrentDecoder;
	
	extern ISensorService *CurrentIntakeAirTemperatureService;
	extern ISensorService *CurrentEngineCoolantTemperatureService;
	extern ISensorService *CurrentManifoldAirPressureService;
	extern ISensorService *CurrentVoltageService;
	extern ISensorService *CurrentThrottlePositionService;
	extern ISensorService *CurrentEthanolContentService;
	extern ISensorService *CurrentVehicleSpeedSensorService;
}