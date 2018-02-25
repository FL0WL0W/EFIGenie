#include "Services.h"
#ifdef IInjectorServiceExists
namespace EngineManagement
{
	void IInjectorService::InjectorOpenTask(void *parameters)
	{
		((IInjectorService *)parameters)->InjectorOpen();
	}
	
	void IInjectorService::InjectorCloseTask(void *parameters)
	{
		((IInjectorService *)parameters)->InjectorClose();
	}

	IInjectorService *CurrentInjectorServices[MAX_CYLINDERS];
}
#endif