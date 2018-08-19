#include "HardwareAbstractionCollection.h"

using namespace HardwareAbstraction;

#ifndef IBOOLEANINPUTSERVICE_H
#define IBOOLEANINPUTSERVICE_H
namespace IOService
{
	class IBooleanInputService
	{
	public:
		virtual void ReadValue() = 0;
		bool Value = false;

		static void ReadValueCallBack(void *booleanInputService);

		static IBooleanInputService* CreateBooleanInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size);
	};
}
#endif