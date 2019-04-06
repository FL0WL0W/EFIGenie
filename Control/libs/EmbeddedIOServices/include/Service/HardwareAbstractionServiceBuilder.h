#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "Service/ServiceLocator.h"

using namespace HardwareAbstraction;

#ifndef HARDWAREABSTRACTIONSERVICEBUILDER_H
#define HARDWAREABSTRACTIONSERVICEBUILDER_H

//hardware abstraction 1-1000
#define HARDWARE_ABSTRACTION_COLLECTION_ID		1
#define ANALOG_SERVICE_ID						2				// IAnalogService			voltage
#define DIGITAL_SERVICE_ID						3				// IDigitalService
#define PWM_SERVICE_ID							4				// IPwmService
#define TIMER_SERVICE_ID						5				// ITimerService

#define TICK_CALL_BACK_GROUP					5001

namespace Service
{
	class HardwareAbstractionServiceBuilder
	{
	public:
		static void Build(ServiceLocator *&serviceLocator, HardwareAbstractionCollection* const &hardwareAbstractionCollection);
	};
}
#endif
