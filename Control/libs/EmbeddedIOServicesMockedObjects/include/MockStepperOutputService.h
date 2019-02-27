#include "IOServices/StepperOutputService/IStepperOutputService.h"

#ifndef MOCKSTEPPERSERVICE_H
#define MOCKSTEPPERSERVICE_H
namespace IOServices
{
	class MockStepperOutputService : public IStepperOutputService
	{
	public:
		MOCK_METHOD1(Step, void(int32_t));
		MOCK_METHOD0(Calibrate, void());
	};
}
#endif