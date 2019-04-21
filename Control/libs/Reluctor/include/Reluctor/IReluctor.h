#include "stdint.h"
#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "Service/ServiceLocator.h"

using namespace Service;
using namespace HardwareAbstraction;

#ifndef IRELUCTOR_H
#define IRELUCTOR_H
namespace Reluctor
{	
	class IReluctor
	{
	public:
		virtual float GetPosition() = 0;
		virtual float GetTickPerDegree() = 0;
		virtual uint16_t GetRpm() = 0;
		virtual uint16_t GetResolution() = 0;
		virtual bool IsSynced() = 0;

		static void* BuildReluctor(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static IReluctor* CreateReluctor(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif