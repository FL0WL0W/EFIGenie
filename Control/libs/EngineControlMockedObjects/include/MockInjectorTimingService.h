#include "EngineControlServices/InjectorTimingService/IInjectorTimingService.h"

#ifndef MOCKINJECTORTIMINGSERVICE_H
#define MOCKINJECTORTIMINGSERVICE_H
namespace EngineControlServices
{
	class MockInjectorTimingService : public IInjectorTimingService
	{
	public:
		MOCK_METHOD0(CalculateInjectorTiming, void());
	};
}
#endif