#include "HardwareAbstractionCollection.h"

#ifndef ISTEPPEROUTPUTSERVICE_H
#define ISTEPPEROUTPUTSERVICE_H
namespace IOService
{
	class IStepperOutputService
	{
	public:
		virtual void Step(int steps) = 0;

		static IStepperOutputService* CreateStepperOutputService(const HardwareAbstraction::HardwareAbstractionCollection *, void *, unsigned int *);
	};
}
#endif