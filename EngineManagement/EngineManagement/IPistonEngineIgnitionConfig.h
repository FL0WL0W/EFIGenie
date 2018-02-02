#define MAX_CYLINDERS 12
#define IGNITION_RPM_RESOLUTION 16
#define IGNITION_MAP_RESOLUTION 16

namespace EngineManagement
{
	struct IgnitionTiming
	{
		float IgnitionDwellTime;
		short IgnitionAdvance64thDegree;
	};

	class IPistonEngineIgnitionConfig
	{
	public:
		virtual IgnitionTiming GetIgnitionTiming() = 0;
	};
}