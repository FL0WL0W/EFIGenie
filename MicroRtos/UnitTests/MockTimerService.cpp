#include <stdint.h>
#include <functional>
#include "ITimerService.h"
#include "MockTimerService.h"

namespace HardwareAbstraction
{
	unsigned int MockTimerService::GetTick()
	{
		return Tick;
	}

	unsigned int MockTimerService::GetTicksPerSecond()
	{
		return TicksPerSecond;
	}
}