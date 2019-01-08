#include "HardwareAbstraction/IPwmService.h"

#ifndef MOCKPWMSERVICE_H
#define MOCKPWNSERVICE_H
namespace HardwareAbstraction
{
	class MockPwmService : public IPwmService
	{
	public:
		MOCK_METHOD3(InitPin, void(unsigned short, PinDirection, unsigned short));
		MOCK_METHOD1(ReadPin, PwmValue(unsigned short));
		MOCK_METHOD2(WritePin, void(unsigned short, PwmValue));
	};
}
#endif