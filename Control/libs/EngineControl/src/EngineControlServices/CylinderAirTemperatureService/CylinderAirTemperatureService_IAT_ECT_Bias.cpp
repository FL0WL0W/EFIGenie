#include "EngineControlServices/CylinderAirTemperatureService/CylinderAirTemperatureService_IAT_ECT_Bias.h"

#ifdef CYLINDERAIRMASSSERVICE_IAT_ECT_BIAS_H
namespace EngineControlServices
{
	CylinderAirTemperatureService_IAT_ECT_Bias::CylinderAirTemperatureService_IAT_ECT_Bias(
		const CylinderAirTemperatureService_IAT_ECT_BiasConfig *config, 
		RpmService *rpmService,
		IFloatInputService *intakeAirTemperatureService,
		IFloatInputService *engineCoolantTemperatureService)
	{		
		_config = config;
		_rpmService = rpmService;
		_intakeAirTemperatureService = intakeAirTemperatureService;
		_engineCoolantTemperatureService = engineCoolantTemperatureService;

		CylinderAirTemperature = reinterpret_cast<float *>(malloc(sizeof(float) * _config->Cylinders));
		for(int cylinder = 0; cylinder < _config->Cylinders; cylinder++)
		{
			CylinderAirTemperature[cylinder] = 30;
		}
	}
	
	void CylinderAirTemperatureService_IAT_ECT_Bias::SetCylinderAirmassService(ICylinderAirmassService *cylinderAirmassService)
	{
		_cylinderAirmassService = cylinderAirmassService;
	}

	void CylinderAirTemperatureService_IAT_ECT_Bias::CalculateAirTemperature()
	{
		unsigned short rpm = _rpmService->Rpm;

		for(int cylinder = 0; cylinder < _config->Cylinders; cylinder++)
		{
			float cylinderAirTemperature = 30;
			float temperatureBias = 0.5f;
			if(_cylinderAirmassService != 0 && _cylinderAirmassService->CylinderAirmass[cylinder] != 0)
			{
				unsigned char temperatureBias = InterpolateTable1<unsigned char>(rpm * _cylinderAirmassService->CylinderAirmass[cylinder], _config->MaxTemperatureBias, 0.0f, _config->TemperatureBiasResolution, _config->TemperatureBias());
			}

			if (_intakeAirTemperatureService != 0)
			{
				if (_engineCoolantTemperatureService != 0)
				{
					cylinderAirTemperature = (_intakeAirTemperatureService->Value * temperatureBias + _engineCoolantTemperatureService->Value * (255 - temperatureBias)) / 255;
				}
				else
				{
					cylinderAirTemperature = _intakeAirTemperatureService->Value * temperatureBias + 100 * (1-temperatureBias);
				}
			}
			else if (_engineCoolantTemperatureService != 0)
			{
				cylinderAirTemperature = 14.6f * temperatureBias + _engineCoolantTemperatureService->Value * (1-temperatureBias);
			}

			CylinderAirTemperature[cylinder] = cylinderAirTemperature;
		}
	}
}
#endif