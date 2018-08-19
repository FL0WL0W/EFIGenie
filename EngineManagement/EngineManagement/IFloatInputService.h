#include "HardwareAbstractionCollection.h"

using namespace HardwareAbstraction;

#ifndef IFLOATINPUTSERVICE_H
#define IFLOATINPUTSERVICE_H
namespace IOService
{
	class IFloatInputService
	{
	public:
		virtual void ReadValue() = 0;
		float Value = 0;
		float ValueDot = 0;

		static void ReadValueCallBack(void *floatInputService);

		static IFloatInputService* CreateFloatInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size);
	};
}
#endif