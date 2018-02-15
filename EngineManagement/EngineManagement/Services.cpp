#include "Services.h"

namespace EngineManagement
{
	HardwareAbstraction::ITimerService *CurrentTimerService;
	HardwareAbstraction::IDigitalService *CurrentDigitalService;
	HardwareAbstraction::IAnalogService *CurrentAnalogService;
	HardwareAbstraction::IPwmService *CurrentPwmService;
	Decoder::IDecoder *CurrentDecoder;
	IIgnitorService *CurrentIgnitorServices[MAX_CYLINDERS];
	IInjectorService *CurrentInjectorServices[MAX_CYLINDERS];
	IMapService *CurrentMapService;
	IFuelTrimService *CurrentFuelTrimService;
	IEngineCoolantTemperatureService *CurrentEngineCoolantTemperatureService;
	IIntakeAirTemperatureService *CurrentIntakeAirTemperatureService;
	IVoltageService *CurrentVoltageService;
	IEthanolService *CurrentEthanolService;
	IAfrService *CurrentAfrService;
	ITpsService *CurrentThrottlePositionService;
	IPrimeService *CurrentPrimeService;
}