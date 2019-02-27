#include "HardwareAbstraction/HardwareAbstractionCollection.h"

using namespace HardwareAbstraction;

#if !defined(ISTEPPEROUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define ISTEPPEROUTPUTSERVICE_H
namespace IOServices
{
	class IStepperOutputService
	{
	public:
		virtual void Step(int32_t steps) = 0;
		virtual void Calibrate() = 0;

		static IStepperOutputService* CreateStepperOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int *sizeOut);
	};
}
#endif
