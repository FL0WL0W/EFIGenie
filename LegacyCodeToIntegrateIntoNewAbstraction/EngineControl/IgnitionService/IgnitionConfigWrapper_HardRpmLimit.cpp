// #include "EngineControlServices/IgnitionService/IgnitionConfigWrapper_HardRpmLimit.h"

// #ifdef IGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H
// namespace EngineControlServices
// {
// 	IgnitionConfigWrapper_HardRpmLimit::IgnitionConfigWrapper_HardRpmLimit(const IgnitionConfigWrapper_HardRpmLimitConfig *config, RpmService *rpmService, IBooleanInputService *booleanInputService, IIgnitionConfig *child)
// 	{				
// 		_config = config;
// 		_rpmService = rpmService;
// 		_booleanInputService = booleanInputService;
// 		_child = child;
// 	}
	
// 	IgnitionTiming IgnitionConfigWrapper_HardRpmLimit::GetIgnitionTiming()
// 	{
// 		_booleanInputService->ReadValue();
// 		unsigned short rpm = _rpmService->Rpm;
		
// 		if (rpm < _config->RpmDisable)
// 			_limitEnabled = false;
// 		else if (rpm > _config->RpmEnable && _booleanInputService != 0 && !_booleanInputService->Value)
// 			_limitEnabled = true;
		
// 		if (_limitEnabled)
// 		{
// 			IgnitionTiming timing = IgnitionTiming();
// 			timing.IgnitionEnable = false;
// 			return timing;
// 		}
		
// 		return _child->GetIgnitionTiming();
// 	}
// }
// #endif