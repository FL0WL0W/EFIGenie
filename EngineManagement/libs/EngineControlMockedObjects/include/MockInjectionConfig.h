#include "EngineControlServices/InjectionService/IInjectionConfig.h"

#ifndef MOCKINJECTIONCONFIG_H
#define MOCKINJECTIONCONFIG_H
namespace EngineControlServices
{
	class MockInjectionConfig : public IInjectionConfig
	{
	public:
		MOCK_METHOD1(GetInjectorTiming, InjectorTiming(unsigned char));
	};
}
#endif