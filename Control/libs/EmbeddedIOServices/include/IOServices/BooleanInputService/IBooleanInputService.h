#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "stdint.h"

using namespace HardwareAbstraction;

#if !defined(IBOOLEANINPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define IBOOLEANINPUTSERVICE_H
namespace IOServices
{
	class IBooleanInputService
	{
	public:
		virtual void ReadValue() = 0;
		bool Value = false;

		static void ReadValueCallBack(void *booleanInputService);

		static IBooleanInputService* CreateBooleanInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif
