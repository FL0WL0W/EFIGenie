#include <map>
#include "Operations/OperationFactory.h"
#include "Operations/OperationPackager.h"
#include "EmbeddedIOServiceCollection.h"

#ifndef ENGINEOPERATIONFACTORYREGISTER_H
#define ENGINEOPERATIONFACTORYREGISTER_H
namespace OperationArchitecture
{
	class EngineOperationFactoryRegister
	{
		public:
		static void Register(uint32_t idOffset, OperationFactory *factory, const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager);
	};
}
#endif