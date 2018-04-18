#include "HardwareAbstractionCollection.h"

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
		
		static IFloatInputService* CreateFloatInputService(const HardwareAbstraction::HardwareAbstractionCollection *, void *, unsigned int *);
	};
}
#endif