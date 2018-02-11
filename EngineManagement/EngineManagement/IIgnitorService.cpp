#include <stdint.h>
#include "ITimerService.h"
#include "IMapService.h"
#include "PinDirection.h"
#include "IDigitalService.h"
#include "IIgnitorService.h"

namespace EngineManagement
{
	void IIgnitorService::CoilDwellTask(void *parameters)
	{
		((IIgnitorService *)parameters)->CoilDwell();
	}
	
	void IIgnitorService::CoilFireTask(void *parameters)
	{
		((IIgnitorService *)parameters)->CoilFire();
	}
}