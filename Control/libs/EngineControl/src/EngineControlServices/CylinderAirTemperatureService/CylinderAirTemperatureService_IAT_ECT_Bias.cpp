#include "EngineControlServices/CylinderAirTemperatureService/CylinderAirTemperatureService_IAT_ECT_Bias.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/IOServicesServiceBuilderRegister.h"
#include "Service/ServiceBuilder.h"

#ifdef CYLINDERAIRTEMPERATURESERVICE_IAT_ECT_BIAS_H
namespace EngineControlServices
{
	CylinderAirTemperatureService_IAT_ECT_Bias::CylinderAirTemperatureService_IAT_ECT_Bias(
		const CylinderAirTemperatureService_IAT_ECT_BiasConfig *config, 
		RpmService *rpmService,
		IFloatInputService *intakeAirTemperatureService,
		IFloatInputService *engineCoolantTemperatureService,
		const ServiceLocator *serviceLocator)
	{		
		_config = config;
		_rpmService = rpmService;
		_intakeAirTemperatureService = intakeAirTemperatureService;
		_engineCoolantTemperatureService = engineCoolantTemperatureService;
		_serviceLocator = serviceLocator;

		CylinderAirTemperature = reinterpret_cast<float *>(malloc(sizeof(float) * _config->Cylinders));
		for(int cylinder = 0; cylinder < _config->Cylinders; cylinder++)
		{
			CylinderAirTemperature[cylinder] = 30;
		}
	}
	void CylinderAirTemperatureService_IAT_ECT_Bias::CalculateCylinderAirTemperature()
	{
		if(_cylinderAirmassService == 0)
			_cylinderAirmassService = _serviceLocator->LocateAndCast<ICylinderAirmassService>(BUILDER_ICYLINDERAIRMASSSERVICE, 0);

		float rps = _rpmService->Rpm / 60.0f;

		for(unsigned char cylinder = 0; cylinder < _config->Cylinders; cylinder++)
		{
			float cylinderAirTemperature = 30;
			float temperatureBias = _config->DefaultTemperatureBias;
			if(_cylinderAirmassService != 0 && _cylinderAirmassService->CylinderAirmass[cylinder] != 0)
			{
				temperatureBias = InterpolateTable1<float>(rps * _config->Cylinders * 0.5f * _cylinderAirmassService->CylinderAirmass[cylinder], _config->MaxTemperatureBiasAirflow, 0.0f, _config->TemperatureBiasResolution, _config->TemperatureBias());
			}

			if (_intakeAirTemperatureService != 0)
			{
				if (_engineCoolantTemperatureService != 0)
				{
					cylinderAirTemperature = (_intakeAirTemperatureService->Value * (1 - temperatureBias) + _engineCoolantTemperatureService->Value * temperatureBias);
				}
				else
				{
					cylinderAirTemperature = _intakeAirTemperatureService->Value * (1 - temperatureBias) + 100 * temperatureBias;
				}
			}
			else if (_engineCoolantTemperatureService != 0)
			{
				cylinderAirTemperature = 14.6f * (1 - temperatureBias) + _engineCoolantTemperatureService->Value * temperatureBias;
			}

			CylinderAirTemperature[cylinder] = cylinderAirTemperature;
		}
	}
}
#endif