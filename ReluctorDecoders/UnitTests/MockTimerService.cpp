#include <stdint.h>
#include <functional>
#include "ITimerService.h"
#include "MockTimerService.h"

namespace HardwareAbstraction
{
	void MockTimerService::SetCallBack(std::function<void(unsigned int)> callBack)
	{
		CallBack = callBack;
	}

	unsigned int MockTimerService::GetTick()
	{
		return Tick;
	}

	void MockTimerService::ScheduleCallBack(unsigned int tick)
	{
		CallBackTick = tick;
	}

	unsigned int MockTimerService::GetTicksPerSecond()
	{
		return TicksPerSecond;
	}
}