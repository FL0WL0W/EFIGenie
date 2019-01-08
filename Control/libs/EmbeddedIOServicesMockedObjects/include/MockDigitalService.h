#include "HardwareAbstraction/IDigitalService.h"
#include "HardwareAbstraction/ICallBack.h"

#ifndef MOCKDIGITALSERVICE_H
#define MOCKDIGITALSERVICE_H
namespace HardwareAbstraction
{
	class MockDigitalService : public IDigitalService
	{
	public:
		MOCK_METHOD2(InitPin, void(unsigned short, PinDirection));
		MOCK_METHOD1(ReadPin, bool(unsigned short));
		MOCK_METHOD2(WritePin, void(unsigned short, bool));
		MOCK_METHOD2(ScheduleRecurringInterrupt, void(unsigned short, ICallBack *));
		MOCK_METHOD2(ScheduleNextInterrupt, void(unsigned short, ICallBack *));
	};
}
#endif