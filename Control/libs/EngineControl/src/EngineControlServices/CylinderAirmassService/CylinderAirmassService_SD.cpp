#include "EngineControlServices/CylinderAirmassService/CylinderAirmassService_SD.h"

#ifdef CYLINDERAIRMASSSERVICE_SD_H
namespace EngineControlServices
{
	CylinderAirmassService_SD::CylinderAirmassService_SD(
		const CylinderAirmassService_SDConfig *config, 
		RpmService *rpmService,
		IFloatInputService *manifoldAbsolutePressureService,
		ICylinderAirTemperatureService *cylinderAirTemperatureService)
	{		
		_config = config;
		_rpmService = rpmService;
		_manifoldAbsolutePressureService = manifoldAbsolutePressureService;
		_cylinderAirTemperatureService = cylinderAirTemperatureService;
		
		CylinderAirmass = reinterpret_cast<float *>(calloc(sizeof(float) * _config->Cylinders, sizeof(float) * _config->Cylinders));
	}
	
	void CylinderAirmassService_SD::CalculateCylinderAirmass()
	{
		unsigned short rpm = _rpmService->Rpm;
		float map = _manifoldAbsolutePressureService->Value;
				
		float VE = InterpolateTable2<unsigned short>((float)rpm, (float)_config->MaxRpm, 0.0f, _config->VeRpmResolution, map, _config->MaxMap, 0.0f, _config->VeMapResolution, _config->VolumetricEfficiencyMap()) / 8192.0f;
								
		float cylinderVolume = _config->CylinderVolume * 1000 * VE; //ml
		
		for(unsigned char cylinder = 0; cylinder < _config->Cylinders; cylinder++)
		{
			float cylinderAirTemperature = 30;
			if(_cylinderAirTemperatureService != 0 && _cylinderAirTemperatureService->CylinderAirTemperature != 0)
			{
				cylinderAirTemperature = _cylinderAirTemperatureService->CylinderAirTemperature[cylinder];
			}

			float airDensity = (map * 101.325f) / (287 /*GasConstant*/ * (cylinderAirTemperature + 273.15f)); // kg/m^3

			CylinderAirmass[cylinder] = cylinderVolume * airDensity;
		}
	}
}
#endif