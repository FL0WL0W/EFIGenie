#include <stm32f10x_gpio.h>
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "IMapService.h"
#include "IDigitalService.h"
#include "IIgnitionService.h"

namespace EngineManagement
{
	void IIgnitionService::CoilDwellTask(void *parameters)
	{
		((IIgnitionService *)parameters)->CoilDwell();
	}
	
	void IIgnitionService::CoilFireTask(void *parameters)
	{
		((IIgnitionService *)parameters)->CoilFire();
	}
}