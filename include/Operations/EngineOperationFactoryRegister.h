#include "Operations/OperationFactory.h"
#include "ServiceRegistry.h"

#ifndef ENGINEOPERATIONFACTORYREGISTER_H
#define ENGINEOPERATIONFACTORYREGISTER_H
namespace EFIGenie
{
	class EngineOperationFactoryRegister
	{
		public:
		static void Register(uint32_t idOffset, OperationArchitecture::OperationFactory *factory, const EmbeddedIOOperations::ServiceRegistry *serviceRegistry);
	};
}
#endif