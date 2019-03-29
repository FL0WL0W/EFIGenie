#include "Service/ServiceLocator.h"

using namespace Service;

#ifndef IFUELTRIMSERVICE_H
#define IFUELTRIMSERVICE_H
namespace EngineControlServices
{
	class IFuelTrimService
	{
	public:
		virtual float GetFuelTrim(unsigned char cylinder) = 0;
		virtual void Tick() = 0;

		static void TickCallBack(void *fuelTrimService);
		static void* CreateFuelTrimService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
#endif
