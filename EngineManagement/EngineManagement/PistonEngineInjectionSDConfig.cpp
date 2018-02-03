#include <map>
#include <functional>
#include "ITimerService.h"
#include "IIgnitorService.h"
#include "IInjectorService.h"
#include "IMapService.h"
#include "IDecoder.h"
#include "IFuelTrimService.h"
#include "IEngineCoolantTemperatureService.h"
#include "IIntakeAirTemperatureService.h"
#include "IVoltageService.h"
#include "IAfrService.h"
#include "PistonEngineConfig.h"
#include "IPistonEngineInjectionConfig.h"
#include "PistonEngineInjectionSDConfig.h"


namespace EngineManagement
{
	PistonEngineInjectionSDConfig::PistonEngineInjectionSDConfig(
		Decoder::IDecoder *decoder, 
		IFuelTrimService *fuelTrimService, 
		IMapService *mapService, 
		IIntakeAirTemperatureService *iatService, 
		IEngineCoolantTemperatureService *ectService, 
		IVoltageService *voltageService, 
		IAfrService *afrService,
		PistonEngineConfig *pistonEngineConfig,
		void *config)
	{
		_decoder = decoder;
		_mapService = mapService;
		_fuelTrimService = fuelTrimService;
		_iatService = iatService;
		_ectService = ectService;
		_voltageService = voltageService;
		_afrService = afrService;
		_pistonEngineConfig = pistonEngineConfig;
		
		LoadConfig(config);
	}
	void PistonEngineInjectionSDConfig::LoadConfig(void *config)
	{
		_injectorOpenPosition64thDegree = *((unsigned short *)config);   //value in 1/64 degrees
		config = (void*)((unsigned short *)config + 1);
		
		_injectorGramsPerMinute = (unsigned short *)config;
		config = (void*)((unsigned short *)config + MAX_CYLINDERS);
		
		_shortPulseLimit = *((float *)config);
		config = (void*)((float *)config + 1);
		
		_shortPulseAdder = (short *)config;//60us increments (value in us)
		config = (void*)((short *)config + (int)(_shortPulseLimit / 0.00006f) + 1);
		
		_offset = (short *)config;
		config = (void*)((short *)config + (INJECTOR_OFFSET_VOLTAGE_RESOLUTION * INJECTOR_OFFSET_MAP_RESOLUTION));
		
		_volumetricEfficiencyMap = ((unsigned short *)config); // value in 1/128%
		config = (void*)((unsigned short *)config + (VE_RPM_RESOLUTION * VE_MAP_RESOLUTION));
		
		_gasConstant = *((unsigned short *)config); //value in 0.1 units
		config = (void*)((unsigned short *)config + 1);
		
		_temperatureBias = ((unsigned char *)config);  //value in 1/256 units (1 to 0 == IAT to ECT), incremented by (map * rpm * VE) from (0 to _mapService->MaxMapKpa * _pistonEngineConfig->MaxRpm * 120)
		config = (void*)((unsigned char *)config + TEMPERATURE_BIAS_RESOLUTION);
	}
	
	InjectorTiming PistonEngineInjectionSDConfig::GetInjectorTiming(uint8_t cylinder)
	{
		InjectorTiming timing = InjectorTiming();
		timing.OpenPosition64thDegree = _injectorOpenPosition64thDegree;
		timing.PulseWidth = 0;
		
		unsigned short rpm = _decoder->GetRpm();
		unsigned short rpmDivision = _pistonEngineConfig->MaxRpm / VE_RPM_RESOLUTION;
		unsigned char rpmIndexL = rpm / rpmDivision;
		unsigned char rpmIndexH = rpmIndexL + 1;
		float rpmMultiplier = ((float)rpm) / rpmDivision - rpmIndexL;
		if (rpmIndexL > VE_RPM_RESOLUTION - 1)
		{
			rpmIndexL = rpmIndexH = VE_RPM_RESOLUTION - 1;
		}
		else if (rpmIndexH > VE_RPM_RESOLUTION - 1)
		{
			rpmIndexH = VE_RPM_RESOLUTION - 1;
		}
		
		unsigned short map = _mapService->MapKpa;
		unsigned short mapDivision = _mapService->MaxMapKpa / VE_MAP_RESOLUTION;
		unsigned char mapIndexL = map / mapDivision;
		unsigned char mapIndexH = mapIndexL + 1;
		float mapMultiplier = ((float)map) / mapDivision - mapIndexL;
		if (mapIndexL > VE_MAP_RESOLUTION - 1)
		{
			mapIndexL = mapIndexH = VE_MAP_RESOLUTION - 1;
		}
		else if (mapIndexH > VE_MAP_RESOLUTION - 1)
		{
			mapIndexH = VE_MAP_RESOLUTION - 1;
		}
		
		float VE =	_volumetricEfficiencyMap[rpmIndexL + VE_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * (1 - mapMultiplier)
		+			_volumetricEfficiencyMap[rpmIndexH + VE_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * (1 - mapMultiplier)
		+			_volumetricEfficiencyMap[rpmIndexL + VE_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * mapMultiplier
		+			_volumetricEfficiencyMap[rpmIndexH + VE_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * mapMultiplier;
		VE *= 0.0078125f;
				
		if (_fuelTrimService != NULL)
			VE += _fuelTrimService->GetFuelTrim(cylinder);
		float cylinderVolume = _pistonEngineConfig->Ml8thPerCylinder * VE * 0.00125f;
		
		unsigned int temperatureBiasCalc = map * rpm * VE;
		unsigned int temperatureBiasDivision = (_mapService->MaxMapKpa * _pistonEngineConfig->MaxRpm * 120) / TEMPERATURE_BIAS_RESOLUTION;
		unsigned char temperatureBiasIndexL = temperatureBiasCalc / temperatureBiasDivision;
		unsigned char temperatureBiasIndexH = temperatureBiasIndexL + 1;
		float temperatureBiasMultiplier = ((float)temperatureBiasCalc) / temperatureBiasDivision - temperatureBiasIndexL;
		if (temperatureBiasIndexL > TEMPERATURE_BIAS_RESOLUTION - 1)
		{
			temperatureBiasIndexL = temperatureBiasIndexH = TEMPERATURE_BIAS_RESOLUTION - 1;
		}
		else if (temperatureBiasIndexH > TEMPERATURE_BIAS_RESOLUTION - 1)
		{
			temperatureBiasIndexH = TEMPERATURE_BIAS_RESOLUTION - 1;
		}
		
		unsigned char temperatureBias = _temperatureBias[temperatureBiasIndexL] * (1 - temperatureBiasMultiplier) + _temperatureBias[temperatureBiasIndexH] * temperatureBiasMultiplier;
		
		float temperature = (_iatService->IntakeAirTemperature * temperatureBias + _ectService->EngineCoolantTemperature * (255 - temperatureBias))/255;
		
		float airDensity = map / (100.0f * _gasConstant * temperature);
		
		float airFuelRatio = _afrService->GetAfr();
		
		float injectorDuration = (cylinderVolume * airDensity) / (airFuelRatio + 0.78f/*density of fuel*/) * 60.0f / _injectorGramsPerMinute[cylinder];
		
		if (injectorDuration <= 0) 
			return timing;
			
		//TODO interpolate this
		if(injectorDuration < _shortPulseLimit)
		{
			unsigned short shortPulseResolution = (_shortPulseLimit / 0.00006f);
			unsigned short injectorDurationDivision = _shortPulseLimit / (shortPulseResolution + 1);
			unsigned short injectorDurationIndexL = injectorDuration / injectorDurationDivision;
			unsigned short injectorDurationIndexH = injectorDurationIndexL + 1;
			float injectorDurationMultiplier = ((float)injectorDuration) / injectorDurationDivision - injectorDurationIndexL;
			if (injectorDurationIndexL > shortPulseResolution)
			{
				injectorDurationIndexL = injectorDurationIndexH = shortPulseResolution;
			}
			else if (injectorDurationIndexH > shortPulseResolution)
			{
				injectorDurationIndexH = shortPulseResolution;
			}
			injectorDuration += (_shortPulseAdder[injectorDurationIndexL] * (1 - injectorDurationMultiplier) + _shortPulseAdder[injectorDurationIndexH] * injectorDurationMultiplier) * 0.000001f;
		}
		
		float voltage = _voltageService->Voltage;
		float voltageDivision = (INJECTOR_OFFSET_VOLTAGE_MAX - INJECTOR_OFFSET_VOLTAGE_MIN) / INJECTOR_OFFSET_VOLTAGE_RESOLUTION;
		unsigned char voltageIndexL = ((voltage - INJECTOR_OFFSET_VOLTAGE_MIN) / voltageDivision);
		unsigned char voltageIndexH = voltageIndexL + 1;
		float voltageMultiplier = ((voltage - INJECTOR_OFFSET_VOLTAGE_MIN) / voltageDivision) - voltageIndexL;
		if (voltageIndexL > INJECTOR_OFFSET_VOLTAGE_RESOLUTION - 1)
		{
			voltageIndexL = voltageIndexH = INJECTOR_OFFSET_VOLTAGE_RESOLUTION - 1;
		}
		else if (voltageIndexH > INJECTOR_OFFSET_VOLTAGE_RESOLUTION - 1)
		{
			voltageIndexH = INJECTOR_OFFSET_VOLTAGE_RESOLUTION - 1;
		}
		
		unsigned short mapOffsetDivision = _mapService->MaxMapKpa / INJECTOR_OFFSET_MAP_RESOLUTION;
		unsigned char mapOffsetIndexL = map / mapDivision;
		unsigned char mapOffsetIndexH = mapOffsetIndexL + 1;
		float mapOffsetMultiplier = ((float)map) / mapDivision - mapOffsetIndexL;
		if (mapOffsetIndexL > INJECTOR_OFFSET_MAP_RESOLUTION - 1)
		{
			mapOffsetIndexL = mapOffsetIndexH = INJECTOR_OFFSET_MAP_RESOLUTION - 1;
		}
		else if (mapOffsetIndexH > INJECTOR_OFFSET_MAP_RESOLUTION - 1)
		{
			mapOffsetIndexH = INJECTOR_OFFSET_MAP_RESOLUTION - 1;
		}
		
		float offset =	(_offset[voltageIndexL + INJECTOR_OFFSET_VOLTAGE_RESOLUTION * mapOffsetIndexL] * (1 - voltageMultiplier) * (1 - mapOffsetMultiplier)) * (1 / 1048576)
		+				_offset[voltageIndexH + INJECTOR_OFFSET_VOLTAGE_RESOLUTION * mapOffsetIndexL] * voltageMultiplier * (1 - mapOffsetMultiplier)
		+				_offset[voltageIndexL + INJECTOR_OFFSET_VOLTAGE_RESOLUTION * mapOffsetIndexH] * (1 - voltageMultiplier) * mapOffsetMultiplier
		+				_offset[voltageIndexH + INJECTOR_OFFSET_VOLTAGE_RESOLUTION * mapOffsetIndexH] * voltageMultiplier * mapOffsetMultiplier;
		
		injectorDuration += offset;
				
		if (injectorDuration <= 0) 
			return timing;
		
		timing.PulseWidth = injectorDuration;
		return timing;
	}
}