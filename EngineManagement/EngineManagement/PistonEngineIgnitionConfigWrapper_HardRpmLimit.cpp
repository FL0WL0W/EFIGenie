#include "PistonEngineIgnitionConfigWrapper_HardRpmLimit.h"

#ifdef PISTONENGINEIGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H
namespace EngineManagement
{
	PistonEngineIgnitionConfigWrapper_HardRpmLimit::PistonEngineIgnitionConfigWrapper_HardRpmLimit(PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig *config, IDecoder *decoder, IBooleanInputService *booleanInputService, IPistonEngineIgnitionConfig *child)
	{				
		_config = config;
		_decoder = decoder;
		_booleanInputService = booleanInputService;
		_child = child;
	}
	
	IgnitionTiming PistonEngineIgnitionConfigWrapper_HardRpmLimit::GetIgnitionTiming()
	{
		_booleanInputService->ReadValue();
		unsigned short rpm = _decoder->GetRpm();
		
		if (rpm < _config->RpmDisable)
			_limitEnabled = false;
		else if (rpm > _config->RpmEnable && _booleanInputService != 0 && !_booleanInputService->Value)
			_limitEnabled = true;
		
		if (_limitEnabled)
		{
			IgnitionTiming timing = IgnitionTiming();
			timing.IgnitionEnable = false;
			return timing;
		}
		
		return _child->GetIgnitionTiming();
	}
}
#endif