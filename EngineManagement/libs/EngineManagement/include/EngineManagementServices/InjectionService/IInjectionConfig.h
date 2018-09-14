#ifndef IINJECTIONCONFIG_H
#define IINJECTIONCONFIG_H
namespace EngineManagementServices
{		
	struct InjectorTiming
	{
		unsigned short OpenPosition64thDegree;
		float PulseWidth;
	};
	
	class IInjectionConfig
	{
	public:
		virtual InjectorTiming GetInjectorTiming(unsigned char injector) = 0;
	};
}
#endif