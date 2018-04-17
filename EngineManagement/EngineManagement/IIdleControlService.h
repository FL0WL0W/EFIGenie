#include "ServiceLocator.h"

using namespace Service;

#ifndef IIDLECONTROLSERVICE_H
#define IIDLECONTROLSERVICE_H
namespace ApplicationService
{
	class IIdleControlService
	{
	public:
		short RpmError;
		virtual void Tick() = 0;
		
		static IIdleControlService* CreateIdleControlService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
	};
}
#endif