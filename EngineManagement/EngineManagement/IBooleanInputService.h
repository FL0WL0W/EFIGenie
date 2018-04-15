#include "HardwareAbstractionCollection.h"

#ifndef IBOOLEANINPUTSERVICE_H
#define IBOOLEANINPUTSERVICE_H
namespace IOServiceLayer
{
	class IBooleanInputService
	{
	public:
		virtual void ReadValue() = 0;
		bool Value = false;

		static IBooleanInputService* CreateBooleanInputService(const HardwareAbstraction::HardwareAbstractionCollection *, void *, unsigned int *);
	};
}
#endif