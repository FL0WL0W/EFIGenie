#include "EngineControlServices/InjectorGramService/InjectorGramService.h"

#ifdef INJECTORGRAMSERVICE_H
namespace EngineControlServices
{
	InjectorGramService::InjectorGramService(
		const InjectorGramServiceConfig *config, 
		ICylinderAirmassService *cylinderArmassService,
		IAfrService *afrService,
		IFuelTrimService *fuelTrimService)
	{		
		_config = config;
		_cylinderArmassService = cylinderArmassService;
		_afrService = afrService;
		_fuelTrimService = fuelTrimService;

		InjectorGrams = reinterpret_cast<float *>(calloc(sizeof(float) * _config->Injectors, sizeof(float) * _config->Injectors));
	}
	
	void InjectorGramService::CalculateInjectorGrams()
	{					
		for(unsigned char injector = 0; injector < _config->Injectors; injector++)
		{	
			unsigned char cylinder = _config->InjectorToCylinder()[injector];
			float fuelTrim = 1;
			if(_fuelTrimService != 0)
			{
				fuelTrim = _fuelTrimService->GetFuelTrim(cylinder);
			}

			InjectorGrams[injector] = (_cylinderArmassService->CylinderAirmass[cylinder] / _afrService->Afr) * fuelTrim;
		}
	}
}
#endif