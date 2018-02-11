#define VE_RPM_RESOLUTION 16
#define VE_MAP_RESOLUTION 16
#define IGNITION_RPM_RESOLUTION 16
#define IGNITION_MAP_RESOLUTION 16

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
		virtual InjectorTiming GetInjectorTiming(unsigned char cylinder) = 0;
	};
}