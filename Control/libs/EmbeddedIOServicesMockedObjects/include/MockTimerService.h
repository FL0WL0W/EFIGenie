#include "HardwareAbstraction/ITimerService.h"

#ifndef MOCKTIMERSERVICE_H
#define MOCKTIMERSERVICE_H
namespace HardwareAbstraction
{
	class MockTimerService : public ITimerService
	{
	public:
		uint32_t Tick;
		MOCK_METHOD1(ScheduleCallBack, void(uint32_t tick));
		MOCK_METHOD0(GetTick, const uint32_t());
		MOCK_METHOD0(GetTicksPerSecond, const uint32_t());
	};
}
#endif