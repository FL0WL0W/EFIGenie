#include "HardwareAbstraction/HardwareAbstractionCollection.h"

using namespace HardwareAbstraction;

#if !defined(IFLOATINPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define IFLOATINPUTSERVICE_H
namespace IOServices
{
	class IFloatInputService
	{
	public:
		virtual void ReadValue() = 0;
		float Value = 0;
		float ValueDot = 0;

		static void ReadValueCallBack(void *floatInputService);

		static IFloatInputService* CreateFloatInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, uint32_t *sizeOut);
	};
}
#endif
