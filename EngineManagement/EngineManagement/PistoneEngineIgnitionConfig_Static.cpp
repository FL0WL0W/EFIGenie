#include "PistonEngineIgnitionConfig_Static.h"

#ifdef PISTONENGINEIGNITIONCONFIG_STATIC_H
namespace EngineManagement
{
	PistonEngineIgnitionConfig_Static::PistonEngineIgnitionConfig_Static(PistonEngineIgnitionConfig_StaticConfig *config)
	{				
		_config = config;
		_ignitionTiming = IgnitionTiming();
		_ignitionTiming.IgnitionAdvance64thDegree = _config->IgnitionAdvance64thDegree;
		_ignitionTiming.IgnitionDwellTime = _config->IgnitionDwellTime;
		_ignitionTiming.IgnitionEnable = true;
	}
	
	IgnitionTiming PistonEngineIgnitionConfig_Static::GetIgnitionTiming()
	{
		return _ignitionTiming;
	}
}
#endif