#include "EngineControlServices/IgnitionService/IIgnitionConfig.h"

#ifndef MOCKIGNITIONCONFIG_H
#define MOCKIGNITIONCONFIG_H
namespace EngineControlServices
{
	class MockIgnitionConfig : public IIgnitionConfig
	{
	public:
		MOCK_METHOD0(GetIgnitionTiming, IgnitionTiming());
	};
}
#endif