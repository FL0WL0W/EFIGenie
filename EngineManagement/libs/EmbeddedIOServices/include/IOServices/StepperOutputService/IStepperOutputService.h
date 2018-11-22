#include "HardwareAbstraction/HardwareAbstractionCollection.h"

using namespace HardwareAbstraction;

#ifndef ISTEPPEROUTPUTSERVICE_H
#define ISTEPPEROUTPUTSERVICE_H
namespace IOServices
{
	class IStepperOutputService
	{
	public:
		virtual void Step(int steps) = 0;

		static IStepperOutputService* CreateStepperOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *sizeOut);
	};
}
#endif