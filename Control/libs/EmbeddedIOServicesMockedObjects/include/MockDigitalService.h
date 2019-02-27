#include "HardwareAbstraction/IDigitalService.h"
#include "HardwareAbstraction/ICallBack.h"

#ifndef MOCKDIGITALSERVICE_H
#define MOCKDIGITALSERVICE_H
namespace HardwareAbstraction
{
	class MockDigitalService : public IDigitalService
	{
	public:
		MOCK_METHOD2(InitPin, void(uint16_t, PinDirection));
		MOCK_METHOD1(ReadPin, bool(uint16_t));
		MOCK_METHOD2(WritePin, void(uint16_t, bool));
		MOCK_METHOD2(ScheduleRecurringInterrupt, void(uint16_t, ICallBack *));
		MOCK_METHOD2(ScheduleNextInterrupt, void(uint16_t, ICallBack *));
	};
}
#endif