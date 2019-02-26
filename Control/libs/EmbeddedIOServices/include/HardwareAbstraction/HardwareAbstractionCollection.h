#include "PinDirection.h"
#include "IDigitalService.h"
#include "IPwmService.h"
#include "IAnalogService.h"
#include "ITimerService.h"

#ifndef HARDWAREABSTRACTIONCOLLECTION_H
#define HARDWAREABSTRACTIONCOLLECTION_H
namespace HardwareAbstraction
{
	struct HardwareAbstractionCollection
	{
	public:
		IDigitalService *DigitalService;
		IPwmService *PwmService;
		IAnalogService *AnalogService;
		ITimerService *TimerService;
	};
}
#endif
