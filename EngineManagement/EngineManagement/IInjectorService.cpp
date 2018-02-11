#include <stdint.h>
#include "ITimerService.h"
#include "IMapService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
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