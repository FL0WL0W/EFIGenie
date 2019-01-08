#ifndef IIGNITIONCONFIG_H
#define IIGNITIONCONFIG_H
namespace EngineControlServices
{
	struct IgnitionTiming
	{
		bool IgnitionEnable;
		float IgnitionDwellTime;
		short IgnitionAdvance64thDegree;
	};

	class IIgnitionConfig
	{
	public:
		virtual IgnitionTiming GetIgnitionTiming() = 0;
	};
}
#endif