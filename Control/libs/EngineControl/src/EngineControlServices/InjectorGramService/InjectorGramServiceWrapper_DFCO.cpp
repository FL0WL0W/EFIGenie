#include "EngineControlServices/InjectorGramService/InjectorGramServiceWrapper_DFCO.h"

#ifdef INJECTORGRAMSERVICEWRAPPER_DFCO_H
namespace EngineControlServices
{
	InjectorGramServiceWrapper_DFCO::InjectorGramServiceWrapper_DFCO(const InjectorGramServiceWrapper_DFCOConfig *config, IFloatInputService *throttlePositionService, RpmService *rpmService, IInjectorGramService *child)
	{
		_config = config;
		_throttlePositionService = throttlePositionService;
		_rpmService = rpmService;
		_child = child;
		InjectorGrams = _child->InjectorGrams;
	}
	
	void InjectorGramServiceWrapper_DFCO::CalculateInjectorGrams()
	{
		float tps = _throttlePositionService->Value;
		unsigned short rpm = _rpmService->Rpm;
		
		if (tps < _config->TpsThreshold && rpm > _config->RpmEnable)
			_dfcoEnabled = true;
		if (rpm < _config->RpmDisable)
			_dfcoEnabled = false;
		
		if (!_dfcoEnabled)
		{
			_child->CalculateInjectorGrams();
			InjectorGrams = _child->InjectorGrams;
		}
		else
		{
			InjectorGrams = 0;
		}
	}
}
#endif