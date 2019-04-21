#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "Service/ServiceLocator.h"
#include "stdint.h"

using namespace HardwareAbstraction;
using namespace Service;

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

		static void* BuildBooleanInputService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static IBooleanInputService* CreateBooleanInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif
