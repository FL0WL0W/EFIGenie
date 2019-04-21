#include "Service/ReluctorServiceBuilderRegister.h"
#include "Reluctor/IReluctor.h"

using namespace Reluctor;

#ifdef RELUCTORSERVICEBUILDEREGISTER_H
namespace Service
{
	void ReluctorServiceBuilderRegister::Register(ServiceBuilder *&serviceBuilder)
	{
		serviceBuilder->Register(BUILDER_IRELUCTOR, IReluctor::BuildReluctor);
	}
}
#endif
