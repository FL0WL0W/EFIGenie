#include "PistonEngineInjectionConfigWrapper_DFCO.h"

#ifdef PISTONENGINEINJECTIONCONFIGWRAPPER_DFCO_H
namespace EngineManagement
{
	PistonEngineInjectionConfigWrapper_DFCO::PistonEngineInjectionConfigWrapper_DFCO(PistonEngineInjectionConfigWrapper_DFCOConfig *config, IFloatInputService *throttlePositionService, IDecoder *decoder, IPistonEngineInjectionConfig *child)
	{
		_config = config;
		_throttlePositionService = throttlePositionService;
		_decoder = decoder;
		_child = child;
	}
	
	InjectorTiming PistonEngineInjectionConfigWrapper_DFCO::GetInjectorTiming(unsigned char cylinder)
	{
		float tps = _throttlePositionService->Value;
		unsigned short rpm = _decoder->GetRpm();
		
		if (tps < _config->TpsThreshold && rpm > _config->RpmEnable)
			_dfcoEnabled = true;
		if (rpm < _config->RpmDisable)
			_dfcoEnabled = false;
		
		if (_dfcoEnabled)
		{
			InjectorTiming timing = InjectorTiming();
			timing.OpenPosition64thDegree = 0;
			timing.PulseWidth = 0;
			return timing;
		}
		
		return _child->GetInjectorTiming(cylinder);
	}
}
#endif