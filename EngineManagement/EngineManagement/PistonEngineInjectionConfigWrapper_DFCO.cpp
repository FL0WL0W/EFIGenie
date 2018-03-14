#include "Services.h"
#include "PistonEngineFactory.h"

#ifdef PistonEngineInjectionConfigWrapper_DFCOExists
namespace EngineManagement
{
	PistonEngineInjectionConfigWrapper_DFCO::PistonEngineInjectionConfigWrapper_DFCO(void *config)
	{
		if (CurrentThrottlePositionService == 0)
			return; //TODO: figure out error handling
		
		_tpsEnable = *(float *)config;
		config = (void*)((float *)config + 1);
		
		_rpmEnable = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_rpmDisable = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_child = CreatePistonEngineInjectionConfig(config);
	}
	
	InjectorTiming PistonEngineInjectionConfigWrapper_DFCO::GetInjectorTiming(unsigned char cylinder)
	{
		float tps = CurrentThrottlePositionService->Value;
		unsigned short rpm = CurrentDecoder->GetRpm();
		
		if (tps < _tpsEnable && rpm > _rpmEnable)
			_dfcoEnabled = true;
		if (rpm < _rpmDisable)
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