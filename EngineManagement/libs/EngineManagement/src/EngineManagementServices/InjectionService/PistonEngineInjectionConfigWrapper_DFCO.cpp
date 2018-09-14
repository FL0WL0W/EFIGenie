#include "EngineManagementServices/InjectionService/InjectionConfigWrapper_DFCO.h"

#ifdef INJECTIONCONFIGWRAPPER_DFCO_H
namespace EngineManagementServices
{
	InjectionConfigWrapper_DFCO::InjectionConfigWrapper_DFCO(InjectionConfigWrapper_DFCOConfig *config, IFloatInputService *throttlePositionService, ICrankCamDecoder *decoder, IInjectionConfig *child)
	{
		_config = config;
		_throttlePositionService = throttlePositionService;
		_decoder = decoder;
		_child = child;
	}
	
	InjectorTiming InjectionConfigWrapper_DFCO::GetInjectorTiming(unsigned char injector)
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
		
		return _child->GetInjectorTiming(injector);
	}
}
#endif