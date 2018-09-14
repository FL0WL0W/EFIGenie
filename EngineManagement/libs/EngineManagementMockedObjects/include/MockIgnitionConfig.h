#include "EngineManagementServices/IgnitionService/IIgnitionConfig.h"

#ifndef MOCKIGNITIONCONFIG_H
#define MOCKIGNITIONCONFIG_H
namespace EngineManagementServices
{
	class MockIgnitionConfig : public IIgnitionConfig
	{
	public:
		MOCK_METHOD0(GetIgnitionTiming, IgnitionTiming());
	};
}
#endif