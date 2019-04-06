#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "Service/ServiceLocator.h"
#include "stdint.h"

using namespace HardwareAbstraction;
using namespace Service;

#if !defined(IFLOATINPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define IFLOATINPUTSERVICE_H
#define BUILDER_IFLOATINPUTSERVICE 2003
namespace IOServices
{
	class IFloatInputService
	{
	public:
		virtual void ReadValue() = 0;
		float Value = 0;
		float ValueDot = 0;

		static void ReadValueCallBack(void *floatInputService);

		static void* BuildFloatInputService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static IFloatInputService* CreateFloatInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif
