#include "IOServiceCollection.h"

#ifndef IIDLECONTROLSERVICE_H
#define IIDLECONTROLSERVICE_H
namespace EngineManagement
{
	class IIdleControlService
	{
	public:
		short RpmError;
		virtual void Tick() = 0;
		
		static IIdleControlService* CreateIdleControlService(const IOServiceLayer::IOServiceCollection *iOServiceCollection, void *config);
	};
}
#endif