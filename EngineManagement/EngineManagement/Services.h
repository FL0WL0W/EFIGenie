#include "ITimerService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
#include "IAnalogService.h"
#include "IPwmService.h"

#include "IIdleControlService.h"
#include "IIgnitorService.h"
#include "IInjectorService.h"
#include "ISensorService.h"
#include "IDecoder.h"
#include "IFuelTrimService.h"
#include "IPrimeService.h"
#include "IFuelPumpService.h"
#include "IAfrService.h"
#include "TachometerService.h"
#include "IIdleAirControlValveService.h"

namespace EngineManagement
{
	extern HardwareAbstraction::ITimerService *CurrentTimerService;
	extern HardwareAbstraction::IDigitalService *CurrentDigitalService;
	extern HardwareAbstraction::IAnalogService *CurrentAnalogService;
	extern HardwareAbstraction::IPwmService *CurrentPwmService;
	extern Decoder::IDecoder *CurrentDecoder;
	
	extern ISensorService *CurrentIntakeAirTemperatureService;//degrees C
	extern ISensorService *CurrentEngineCoolantTemperatureService;// degrees C
	extern ISensorService *CurrentManifoldAbsolutePressureService;// Bar
	extern ISensorService *CurrentVoltageService;// Volts
	extern ISensorService *CurrentThrottlePositionService;// TPS 0.0-1.0
	extern ISensorService *CurrentEthanolContentService;// Content 0.0-1.0
	extern ISensorService *CurrentVehicleSpeedSensorService;// MPH cause thats what people care about
}