#include <stdint.h>
#include <map>
#include <functional>
#include <algorithm>
#include "ITimerService.h"
#include "MicroRtos.h"

namespace MicroRtos
{	
	MicroRtos::MicroRtos(HardwareAbstraction::ITimerService *timerService)
	{
		_timerService = timerService;
	}

}