#include "HardwareAbstraction/IDigitalService.h"
#include "HardwareAbstraction/ICallBack.h"

#ifndef MOCKDIGITALSERVICE_H
#define MOCKDIGITALSERVICE_H
namespace HardwareAbstraction
{
	class MockDigitalService : public IDigitalService
	{
	public:
		MOCK_METHOD2(InitPin, void(unsigned char, PinDirection));
		MOCK_METHOD1(ReadPin, bool(unsigned char));
		MOCK_METHOD2(WritePin, void(unsigned char, bool));
		MOCK_METHOD2(ScheduleRecurringInterrupt, void(unsigned char, ICallBack *));
		MOCK_METHOD2(ScheduleNextInterrupt, void(unsigned char, ICallBack *));
	};
}
#endif