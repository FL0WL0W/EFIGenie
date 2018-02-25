#if !defined(NOIGNITION)
#define IPistonEngineIgnitionConfigExists
namespace EngineManagement
{
	struct IgnitionTiming
	{
		bool ignitionEnable;
		float IgnitionDwellTime;
		short IgnitionAdvance64thDegree;
	};

	class IPistonEngineIgnitionConfig
	{
	public:
		virtual IgnitionTiming GetIgnitionTiming() = 0;
	};

	extern IPistonEngineIgnitionConfig *CurrentPistonEngineIgnitionConfig;

	IPistonEngineIgnitionConfig* CreatePistonEngineIgnitionConfig(void *config);
}
#endif