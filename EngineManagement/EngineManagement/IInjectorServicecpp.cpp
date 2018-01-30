#include <stm32f10x_gpio.h>
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "IMapService.h"
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