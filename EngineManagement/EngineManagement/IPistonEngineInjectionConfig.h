#if !defined(NOINJECTION)
#define IPistonEngineInjectionConfigExists
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

	extern IPistonEngineInjectionConfig *CurrentPistonEngineInjectionConfig;

	IPistonEngineInjectionConfig* CreatePistonEngineInjectionConfig(void *config);
}
#endif