#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "Service/ServiceLocator.h"
#include "stdint.h"

using namespace HardwareAbstraction;
using namespace Service;

#if !defined(IFLOATOUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define IFLOATOUTPUTSERVICE_H
namespace IOServices
{
	class IFloatOutputService
	{
	public:
		virtual void SetOutput(float output) = 0;
		virtual void Calibrate() = 0;
		
		static void* BuildFloatOutputService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static IFloatOutputService* CreateFloatOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif
