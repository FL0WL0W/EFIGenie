#include "Service/HardwareAbstractionServiceBuilder.h"

#ifdef HARDWAREABSTRACTIONSERVICEBUILDER_H
namespace Service
{
	void HardwareAbstractionServiceBuilder::Build(ServiceLocator *&serviceLocator, HardwareAbstractionCollection* const &hardwareAbstractionCollection)
    {
        serviceLocator->Register(HARDWARE_ABSTRACTION_COLLECTION_ID, hardwareAbstractionCollection);
        serviceLocator->Register(ANALOG_SERVICE_ID, hardwareAbstractionCollection->AnalogService);
        serviceLocator->Register(DIGITAL_SERVICE_ID, hardwareAbstractionCollection->DigitalService);
        serviceLocator->Register(PWM_SERVICE_ID, hardwareAbstractionCollection->PwmService);
        serviceLocator->Register(TIMER_SERVICE_ID, hardwareAbstractionCollection->TimerService);
        serviceLocator->Register(TICK_CALL_BACK_GROUP, new CallBackGroup());
    }
}
#endif
