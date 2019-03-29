#include "Service/ServiceLocator.h"

using namespace Service;

#ifndef IIDLECONTROLSERVICE_H
#define IIDLECONTROLSERVICE_H
namespace EngineControlServices
{
	class IIdleControlService
	{
	public:
		short RpmError;
		virtual void Tick() = 0;

		static void TickCallBack(void *idleControlService);
		static void* CreateIdleControlService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
#endif