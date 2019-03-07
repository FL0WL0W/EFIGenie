#include "EngineControlServices/InjectionService/InjectionConfigWrapper_DFCO.h"

#ifdef INJECTIONCONFIGWRAPPER_DFCO_H
namespace EngineControlServices
{
	InjectionConfigWrapper_DFCO::InjectionConfigWrapper_DFCO(const InjectionConfigWrapper_DFCOConfig *config, IFloatInputService *throttlePositionService, RpmService *rpmService, IInjectionConfig *child)
	{
		_config = config;
		_throttlePositionService = throttlePositionService;
		_rpmService = rpmService;
		_child = child;
	}
	
	InjectorTiming InjectionConfigWrapper_DFCO::GetInjectorTiming(unsigned char injector)
	{
		float tps = _throttlePositionService->Value;
		unsigned short rpm = _rpmService->Rpm;
		
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