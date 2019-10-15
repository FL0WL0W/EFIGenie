// #include "EngineControlServices/IgnitionService/IgnitionConfig_Static.h"

// #ifdef IGNITIONCONFIG_STATIC_H
// namespace EngineControlServices
// {
// 	IgnitionConfig_Static::IgnitionConfig_Static(const IgnitionConfig_StaticConfig *config)
// 	{				
// 		_config = config;
// 		_ignitionTiming = IgnitionTiming();
// 		_ignitionTiming.IgnitionAdvance64thDegree = _config->IgnitionAdvance64thDegree;
// 		_ignitionTiming.IgnitionDwellTime = _config->IgnitionDwellTime;
// 		_ignitionTiming.IgnitionEnable = true;
// 	}
	
// 	IgnitionTiming IgnitionConfig_Static::GetIgnitionTiming()
// 	{
// 		return _ignitionTiming;
// 	}
// }
// #endif