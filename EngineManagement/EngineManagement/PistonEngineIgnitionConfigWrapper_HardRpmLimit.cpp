#include "Services.h"
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfigWrapper_HardRpmLimit.h"

namespace EngineManagement
{
	PistonEngineIgnitionConfigWrapper_HardRpmLimit::PistonEngineIgnitionConfigWrapper_HardRpmLimit(void *config)
	{		
		_pinEnable = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		_pinNormalOn = (bool)(*(unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_rpmEnable = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_rpmDisable = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_child = CreatePistonEngineIgnitionConfig(config);
	}
	
	IgnitionTiming PistonEngineIgnitionConfigWrapper_HardRpmLimit::GetIgnitionTiming()
	{
		unsigned short rpm = CurrentDecoder->GetRpm();
		
		if (rpm < _rpmDisable)
			_limitEnabled = false;
		else if (rpm > _rpmEnable && (_pinEnable == 0 || CurrentDigitalService->ReadPin(_pinEnable) != _pinNormalOn))
			_limitEnabled = true;
		
		if (_limitEnabled)
		{
			IgnitionTiming timing = IgnitionTiming();
			timing.ignitionEnable = false;
			return timing;
		}
		
		return _child->GetIgnitionTiming();
	}
}