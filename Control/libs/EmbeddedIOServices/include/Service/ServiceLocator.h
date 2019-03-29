#include <map>
#include "stdint.h"

#ifndef SERVICELOCATOR_H
#define SERVICELOCATOR_H

//hardware abstraction 1-1000
#define HARDWARE_ABSTRACTION_COLLECTION_ID		1
#define ANALOG_SERVICE_ID						2				// IAnalogService			voltage
#define DIGITAL_SERVICE_ID						3				// IDigitalService
#define PWM_SERVICE_ID							4				// IPwmService
#define TIMER_SERVICE_ID						5				// ITimerService

#define TICK_CALL_BACK_GROUP					5001

namespace Service
{
	class ServiceLocator
	{
	protected:
		std::map<uint16_t, void *> _services;
	public:
		void Register(uint16_t serviceId, void *service);
		void* Locate(uint16_t serviceId) const;
		template<typename K>
		K *LocateAndCast(uint16_t serviceId) const
		{
			return reinterpret_cast<K *>(Locate(serviceId));
		}

		void Unregister(uint16_t serviceId);
	};
}
#endif
