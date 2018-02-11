#define IGNITION_RPM_RESOLUTION 16
#define IGNITION_MAP_RESOLUTION 16

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
}