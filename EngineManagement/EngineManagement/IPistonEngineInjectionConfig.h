#ifndef IPISTONENGINEINJECTIONCONFIG_H
#define IPISTONENGINEINJECTIONCONFIG_H
namespace EngineManagement
{		
	struct InjectorTiming
	{
		unsigned short OpenPosition64thDegree;
		float PulseWidth;
	};
	
	class IPistonEngineInjectionConfig
	{
	public:
		virtual InjectorTiming GetInjectorTiming(unsigned char injector) = 0;
	};
}
#endif