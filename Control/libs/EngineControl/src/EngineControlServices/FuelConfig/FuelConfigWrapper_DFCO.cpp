#include "EngineControlServices/FuelConfig/FuelConfigWrapper_DFCO.h"

#ifdef FUELCONFIGWRAPPER_DFCO_H
namespace EngineControlServices
{
	FuelConfigWrapper_DFCO::FuelConfigWrapper_DFCO(const FuelConfigWrapper_DFCOConfig *config, IFloatInputService *throttlePositionService, RpmService *rpmService, IFuelConfig *child)
	{
		_config = config;
		_throttlePositionService = throttlePositionService;
		_rpmService = rpmService;
		_child = child;
	}
	
	float FuelConfigWrapper_DFCO::GetFuelGrams(unsigned char injector)
	{
		float tps = _throttlePositionService->Value;
		unsigned short rpm = _rpmService->Rpm;
		
		if (tps < _config->TpsThreshold && rpm > _config->RpmEnable)
			_dfcoEnabled = true;
		if (rpm < _config->RpmDisable)
			_dfcoEnabled = false;
		
		if (_dfcoEnabled)
		{
			return 0;
		}
		
		return _child->GetFuelGrams(injector);
	}
}
#endif