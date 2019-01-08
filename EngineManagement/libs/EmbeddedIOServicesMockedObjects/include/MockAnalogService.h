#include "HardwareAbstraction/IAnalogService.h"

#ifndef MOCKANALOGSERVICE_H
#define MOCKANALOGSERVICE_H
namespace HardwareAbstraction
{
	class MockAnalogService : public IAnalogService
	{
	public:
		MOCK_METHOD1(InitPin, void(unsigned short));
		MOCK_METHOD1(ReadPin, float(unsigned short));
	};
}
#endif