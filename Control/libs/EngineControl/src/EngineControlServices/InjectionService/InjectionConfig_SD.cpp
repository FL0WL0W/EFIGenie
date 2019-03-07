#include "EngineControlServices/InjectionService/InjectionConfig_SD.h"

#ifdef INJECTIONCONFIG_SD_H
namespace EngineControlServices
{
	InjectionConfig_SD::InjectionConfig_SD(
		const InjectionConfig_SDConfig *config, 
		RpmService *rpmService,
		IFloatInputService *manifoldAbsolutePressureService,
		IAfrService *afrService,
		IFuelTrimService *fuelTrimService,
		IFloatInputService *intakeAirTemperatureService,
		IFloatInputService *engineCoolantTemperatureService,
		IFloatInputService *throttlePositionService,
		IFloatInputService *voltageService)
	{		
		_config = config;
		_rpmService = rpmService;
		_manifoldAbsolutePressureService = manifoldAbsolutePressureService;
		_afrService = afrService;
		_fuelTrimService = fuelTrimService;
		_intakeAirTemperatureService = intakeAirTemperatureService;
		_engineCoolantTemperatureService = engineCoolantTemperatureService;
		_throttlePositionService = throttlePositionService;
		_voltageService = voltageService;
	}
	
	InjectorTiming InjectionConfig_SD::GetInjectorTiming(unsigned char injector)
	{
		InjectorTiming timing = InjectorTiming();
		timing.OpenPosition64thDegree = _config->InjectorOpenPosition64thDegree;
		timing.PulseWidth = 0;
		unsigned short rpm = _rpmService->Rpm;
		float map = _manifoldAbsolutePressureService->Value;
				
		float VE = InterpolateTable2<unsigned short>((float)rpm, (float)_config->MaxRpm, 0.0f, _config->VeRpmResolution, map, _config->MaxMap, 0.0f, _config->VeMapResolution, _config->VolumetricEfficiencyMap()) / 8192.0f;
				
		if (_fuelTrimService != 0)
			VE += _fuelTrimService->GetFuelTrim(injector);
		
		VE *= 0.0078125f;
				
		float cylinderVolume = _config->Ml8thPerCylinder * 0.125f * VE; //ml
		float airDensity = (map * 100 * 1000) / ((_config->GasConstant / 10.0f) * 287.75f); // kg/m^3
		float airFuelRatio = _afrService->Afr;

		unsigned char temperatureBias = InterpolateTable1<unsigned char>((rpm * airFuelRatio * cylinderVolume * airDensity) / (airFuelRatio + airDensity/0.7197f), _config->MaxTemperatureBias, 0.0f, _config->TemperatureBiasResolution, _config->TemperatureBias());
		
		float temperature = 30;
		if (_intakeAirTemperatureService != 0)
		{
			if (_engineCoolantTemperatureService != 0)
				float temperature = (_intakeAirTemperatureService->Value * temperatureBias + _engineCoolantTemperatureService->Value * (255 - temperatureBias)) / 255;
			else
				float temperature = _intakeAirTemperatureService->Value;
		}
		else if (_engineCoolantTemperatureService != 0)
			float temperature = _engineCoolantTemperatureService->Value;
		
		airDensity *= 287.75f * 0.001f / (temperature + 273.15f); // g/ml
						
		float injectorGrams = (cylinderVolume * airDensity) / (airFuelRatio + airDensity/0.7197f);
		
		float injectorDuration =  injectorGrams * 60.0f / _config->InjectorGramsPerMinute()[injector];
				
		injectorDuration += InterpolateTable1<short>(_manifoldAbsolutePressureService->ValueDot, _config->MaxMapDot, -_config->MaxMapDot, _config->MapDotAdderResolution, _config->MapDotAdder()) * 0.000001f;
		
		if (_throttlePositionService != 0)
		{		
			injectorDuration += InterpolateTable1<short>(_throttlePositionService->ValueDot, _config->MaxTpsDot, -_config->MaxTpsDot, _config->TpsDotAdderResolution, _config->TpsDotAdder()) * 0.000001f;
		}
		
		if (injectorDuration <= 0) 
			return timing;
			
		if(injectorDuration < _config->ShortPulseLimit)
			injectorDuration += InterpolateTable1<short>(injectorDuration, _config->ShortPulseLimit, 0, _config->ShortPulseAdderResolution, _config->ShortPulseAdder()) * 0.000001f;
				
		float voltage = 14;
		if (_voltageService != 0)
			voltage = _voltageService->Value;
		
		float offset = InterpolateTable2<short>(voltage, _config->VoltageMax, _config->VoltageMin, _config->OffsetVoltageResolution, map, _config->MaxMap, 0.0f, _config->OffsetMapResolution, _config->Offset()) * 0.000001f;
		
		injectorDuration += offset;
				
		if (injectorDuration <= 0) 
			return timing;
		
		timing.PulseWidth = injectorDuration;
		return timing;
	}
}
#endif