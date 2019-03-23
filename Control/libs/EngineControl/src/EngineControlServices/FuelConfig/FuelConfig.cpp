#include "EngineControlServices/FuelConfig/FuelConfig.h"

#ifdef FUELCONFIG_H
namespace EngineControlServices
{
	FuelConfig::FuelConfig(
		const FuelConfigConfig *config, 
		ICylinderAirmassService *cylinderArmassService,
		IAfrService *afrService,
		IFuelTrimService *fuelTrimService)
	{		
		_config = config;
		_cylinderArmassService = cylinderArmassService;
		_afrService = afrService;
		_fuelTrimService = fuelTrimService;
	}
	
	float FuelConfig::GetFuelGrams(unsigned char injector)
	{						
		return _cylinderArmassService->CylinderAirmass[_config->InjectorToCylinder()[injector]] / _afrService->Afr;
	}
}
#endif