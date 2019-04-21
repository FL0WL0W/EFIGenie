#include "Service/ServiceBuilder.h"

#ifndef RELUCTORSERVICEBUILDEREGISTER_H
#define RELUCTORSERVICEBUILDEREGISTER_H
#define BUILDER_IRELUCTOR 2004
namespace Service
{
	class ReluctorServiceBuilderRegister
	{
	public:
		static void Register(ServiceBuilder *&serviceBuilder);
	};
}
#endif
