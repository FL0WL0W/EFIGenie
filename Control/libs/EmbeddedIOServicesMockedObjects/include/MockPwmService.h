#include "HardwareAbstraction/IPwmService.h"

#ifndef MOCKPWMSERVICE_H
#define MOCKPWNSERVICE_H
namespace HardwareAbstraction
{
	class MockPwmService : public IPwmService
	{
	public:
		MOCK_METHOD3(InitPin, void(uint16_t, PinDirection, uint16_t));
		MOCK_METHOD1(ReadPin, PwmValue(uint16_t));
		MOCK_METHOD2(WritePin, void(uint16_t, PwmValue));
	};
}
#endif