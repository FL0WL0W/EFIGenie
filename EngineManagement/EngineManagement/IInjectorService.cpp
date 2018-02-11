#include "IInjectorService.h"

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
}