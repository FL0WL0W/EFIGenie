#include "Service/ServiceLocator.h"

using namespace Service;

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
		
		static void* CreateIgnitionConfig(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
#endif