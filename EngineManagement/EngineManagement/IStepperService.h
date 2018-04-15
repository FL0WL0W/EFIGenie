#include "HardwareAbstractionCollection.h"

#ifndef ISTEPPERSERVICE_H
#define ISTEPPERSERVICE_H
namespace IOServiceLayer
{
	class IStepperService
	{
	public:
		virtual void Step(int steps);
		
		static IStepperService* CreateStepperService(const HardwareAbstraction::HardwareAbstractionCollection *, void *);
	};
}
#endif