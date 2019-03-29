#include "Service/ServiceLocator.h"

using namespace Service;

#ifndef IINJECTORTIMINGSERVICE_H
#define IINJECTORTIMINGSERVICE_H
namespace EngineControlServices
{			
	struct InjectorTiming
	{
		float OpenPosition;
		float PulseWidth;
	};

	class IInjectorTimingService
	{
	public:
		EngineControlServices::InjectorTiming *InjectorTiming = 0;
		virtual void CalculateInjectorTiming() = 0;

		static void CalculateInjectorTimingCallBack(void *injectorTimingService);
		static void* CreateInjectorTimingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
#endif