#define MAX_CYLINDERS 12
#define VE_RPM_RESOLUTION 16
#define VE_MAP_RESOLUTION 16
#define IGNITION_RPM_RESOLUTION 16
#define IGNITION_MAP_RESOLUTION 16

namespace EngineManagement
{	
	struct InjectorTiming
	{
		uint16_t OpenPosition;
		float PulseWidth;
	};
	
	class IPistonEngineConfig
	{
	public:
		uint8_t Cylinders;
		virtual InjectorTiming GetInjectorTiming(uint8_t cylinder) = 0;
		virtual uint32_t GetIgnitionDwellTime10Us() = 0;
		virtual int16_t GetIgnitionAdvance64thDegree() = 0;
	};
}