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
		//void *config = EmbeddedResources::PistonEngineSDConfigFile_dat.data();
		//Cylinders = ((uint8_t *)config)[0];
		//_mlPerCylinder = ((uint16_t *)config)[1]; //left shifted 2
		//_ignitionDwellTime10Us = ((uint16_t *)config)[2];
		//_maxRpm = ((uint16_t *)config)[3];
		_injectorGramsPerMinute = (unsigned short *)(config) + 8;
		_shortPulseAdder = (short *)(_injectorGramsPerMinute) + (_pistonEngineConfig->Cylinders << 1);//0-4ms, 60us increments
		_offset = _shortPulseAdder + (67 * 2);//8V to 16V in 0.5 increments
		//_ignitionAdvanceMap = _offset + (VE_MAP_RESOLUTION * 32);
		_volumetricEfficiencyMap = ((unsigned short *)_offset) + 2 * IGNITION_RPM_RESOLUTION * IGNITION_MAP_RESOLUTION;
		//gas constant
		//temperature bias
		//injector open position
	}
	
	InjectorTiming PistonEngineInjectionSDConfig::GetInjectorTiming(uint8_t cylinder)
	{
		unsigned short rpm = _decoder->GetRpm();
		unsigned short rpmDivision = _pistonEngineConfig->MaxRpm / VE_RPM_RESOLUTION;
		unsigned char rpmIndexL = rpm / rpmDivision;
		unsigned char rpmIndexH = rpmIndexL + 1;
		float rpmMultiplier = (rpm + 0.0f) / rpmDivision - rpmIndexL;
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
		float mapMultiplier = (map + 0.0f) / mapDivision - mapIndexL;
		if (mapIndexL > VE_MAP_RESOLUTION - 1)
		{
			mapIndexL = mapIndexH = VE_MAP_RESOLUTION - 1;
		}
		else if (mapIndexH > VE_MAP_RESOLUTION - 1)
		{
			mapIndexH = VE_MAP_RESOLUTION - 1;
		}
		
		float VE =	_volumetricEfficiencyMap[rpmIndexL + VE_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * mapMultiplier
		+			_volumetricEfficiencyMap[rpmIndexH + VE_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
		+			_volumetricEfficiencyMap[rpmIndexL + VE_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
		+			_volumetricEfficiencyMap[rpmIndexH + VE_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);	
		VE *= 0.0078125;
				
		if (_fuelTrimService != NULL)
			VE += _fuelTrimService->GetFuelTrim(cylinder);
		float cylinderVolume = _mlPerCylinder / 8.0f * VE;
		
		float temperature = (_iatService->IntakeAirTemperature * _temperatureBias + _ectService->EngineCoolantTemperature * (255 - _temperatureBias))/255;
		
		float airDensity = map / (1000.0f * _gasConstant * temperature);
		
		float airFuelRatio = _afrService->GetAfr();
		
		float injectorDuration = (cylinderVolume * airDensity) / (airFuelRatio + 0.78f/*density of fuel*/) * 60.0f / _injectorGramsPerMinute[cylinder];
		
		//TODO interpolate this
		if(injectorDuration < 0.004f)
			injectorDuration += _shortPulseAdder[(int)(injectorDuration * 16666.666666666666666666666666667f)];
		
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
		float mapOffsetMultiplier = (map + 0.0f) / mapDivision - mapOffsetIndexL;
		if (mapOffsetIndexL > INJECTOR_OFFSET_MAP_RESOLUTION - 1)
		{
			mapOffsetIndexL = mapOffsetIndexH = INJECTOR_OFFSET_MAP_RESOLUTION - 1;
		}
		else if (mapOffsetIndexH > INJECTOR_OFFSET_MAP_RESOLUTION - 1)
		{
			mapOffsetIndexH = INJECTOR_OFFSET_MAP_RESOLUTION - 1;
		}
		
		float offset =	(_offset[voltageIndexL + INJECTOR_OFFSET_VOLTAGE_RESOLUTION * mapOffsetIndexL] * voltageMultiplier * mapOffsetMultiplier
		+				_offset[voltageIndexH + INJECTOR_OFFSET_VOLTAGE_RESOLUTION * mapOffsetIndexL] * (1 - voltageMultiplier) * mapOffsetMultiplier
		+				_offset[voltageIndexL + INJECTOR_OFFSET_VOLTAGE_RESOLUTION * mapOffsetIndexH] * voltageMultiplier * (1 - mapOffsetMultiplier)
		+				_offset[voltageIndexH + INJECTOR_OFFSET_VOLTAGE_RESOLUTION * mapOffsetIndexH] * (1 - voltageMultiplier) * (1 - mapOffsetMultiplier)) * (1 / 1048576);
		
		injectorDuration += offset;
				
		InjectorTiming timing = InjectorTiming();
		timing.PulseWidth = injectorDuration;
		timing.OpenPosition64thDegree = _injectorOpenPosition64thDegree;
		return timing;
	}
}