#ifndef IPISTONENGINEIGNITIONCONFIG_H
#define IPISTONENGINEIGNITIONCONFIG_H
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
#endif