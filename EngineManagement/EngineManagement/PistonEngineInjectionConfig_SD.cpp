#include "Services.h"
#include "PistonEngineConfig.h"
#include "IPistonEngineInjectionConfig.h"
#include "PistonEngineInjectionConfig_SD.h"

#ifdef PistonEngineInjectionConfig_SDExists
namespace EngineManagement
{
	PistonEngineInjectionConfig_SD::PistonEngineInjectionConfig_SD(
		void *config)
	{		
		_maxRpm = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_maxMapBar = *(float *)config;
		config = (void*)((float *)config + 1);
				
		_maxMapBarDot = *(float *)config;
		config = (void*)((float *)config + 1);
		
#ifdef ITpsServiceExists
		_maxTpsDot = *(float *)config;
		config = (void*)((float *)config + 1);
#endif
		
		_voltageMax = *((float *)config);
		config = (void*)((float *)config + 1);
		
		_voltageMin = *((float *)config);
		config = (void*)((float *)config + 1);
				
		_veRpmResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_veMapResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_offsetMapResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_offsetVoltageResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
				
		_temperatureBiasResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
#ifdef ITpsServiceExists
		_tpsDotAdderResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
#endif
		
		_mapDotAdderResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_injectorOpenPosition64thDegree = *((unsigned short *)config);    //value in 1/64 degrees
		config = (void*)((unsigned short *)config + 1);
		
		_injectorGramsPerMinute = (unsigned short *)config;
		config = (void*)((unsigned short *)config + MAX_CYLINDERS);
		
		_shortPulseLimit = *((float *)config);
		config = (void*)((float *)config + 1);
		
		_shortPulseAdder = (short *)config; //60us increments (value in us)
		config = (void*)((short *)config + (int)(_shortPulseLimit / 0.00006f) + 1);
		
		_offset = (short *)config;
		config = (void*)((short *)config + (_offsetVoltageResolution * _offsetMapResolution));
		
		_volumetricEfficiencyMap = ((unsigned short *)config);  // value in 1/128%
		config = (void*)((unsigned short *)config + (_veRpmResolution * _veMapResolution));
		
		_gasConstant = *((unsigned short *)config);  //value in 0.1 units
		config = (void*)((unsigned short *)config + 1);
		
		_temperatureBias = ((unsigned char *)config);   //value in 1/256 units (1 to 0 == IAT to ECT), incremented by (map * rpm * VE) from (0 to _mapService->MaxMapBar * _pistonEngineConfig->MaxRpm * 120)
		config = (void*)((unsigned char *)config + _temperatureBiasResolution);
		
#ifdef ITpsServiceExists
		_tpsDotAdder = ((short *)config);  //(value in us)
		config = (void*)((short *)config + _tpsDotAdderResolution);
#endif		
		
		_mapDotAdder = ((short *)config);  //(value in us)
		config = (void*)((short *)config + _mapDotAdderResolution);
	}
	
	InjectorTiming PistonEngineInjectionConfig_SD::GetInjectorTiming(unsigned char cylinder)
	{
		InjectorTiming timing = InjectorTiming();
		timing.OpenPosition64thDegree = _injectorOpenPosition64thDegree;
		timing.PulseWidth = 0;
		
		unsigned char rpmIndexL = 0;
		unsigned char rpmIndexH = 0;
		float rpmMultiplier = 0;
			unsigned short rpm = CurrentDecoder->GetRpm();
		if (_veRpmResolution > 1)
		{
			unsigned short rpmDivision = _maxRpm / _veRpmResolution;
			rpmIndexL = rpm / rpmDivision;
			rpmIndexH = rpmIndexL + 1;
			rpmMultiplier = ((float)rpm) / rpmDivision - rpmIndexL;
			if (rpmIndexL > _veRpmResolution - 1)
			{
				rpmIndexL = rpmIndexH = _veRpmResolution - 1;
			}
			else if (rpmIndexH > _veRpmResolution - 1)
			{
				rpmIndexH = _veRpmResolution - 1;
			}
		}
		
		unsigned char mapIndexL = 0;
		unsigned char mapIndexH = 0;
		float mapMultiplier = 0;
		float map = CurrentMapService->MapBar;
		if (_veMapResolution > 1)
		{
			float mapDivision = _maxMapBar / _veMapResolution;
			mapIndexL = map / mapDivision;
			mapIndexH = mapIndexL + 1;
			mapMultiplier = ((float)map) / mapDivision - mapIndexL;
			if (mapIndexL > _veMapResolution - 1)
			{
				mapIndexL = mapIndexH = _veMapResolution - 1;
			}
			else if (mapIndexH > _veMapResolution - 1)
			{
				mapIndexH = _veMapResolution - 1;
			}
		}
		
		float VE =	_volumetricEfficiencyMap[rpmIndexL + _veRpmResolution * mapIndexL] * (1 - rpmMultiplier) * (1 - mapMultiplier)
		+			_volumetricEfficiencyMap[rpmIndexH + _veRpmResolution * mapIndexL] * rpmMultiplier * (1 - mapMultiplier)
		+			_volumetricEfficiencyMap[rpmIndexL + _veRpmResolution * mapIndexH] * (1 - rpmMultiplier) * mapMultiplier
		+			_volumetricEfficiencyMap[rpmIndexH + _veRpmResolution * mapIndexH] * rpmMultiplier * mapMultiplier;
				
#ifdef IFuelTrimServiceExists
		if (CurrentFuelTrimService != 0)
			VE += CurrentFuelTrimService->GetFuelTrim(cylinder);
#endif
		VE *= 0.0078125f;

		float cylinderVolume = _pistonEngineConfig->Ml8thPerCylinder * VE * 0.00125f;
		
		unsigned char temperatureBiasIndexL = 0;
		unsigned char temperatureBiasIndexH = 0;
		float temperatureBiasMultiplier = 0;
		if (_temperatureBiasResolution > 1)
		{
			unsigned int temperatureBiasCalc = map * rpm * VE;
			unsigned int temperatureBiasDivision = (_maxMapBar * _maxRpm * 120) / _temperatureBiasResolution;
			temperatureBiasIndexL = temperatureBiasCalc / temperatureBiasDivision;
			temperatureBiasIndexH = temperatureBiasIndexL + 1;
			temperatureBiasMultiplier = ((float)temperatureBiasCalc) / temperatureBiasDivision - temperatureBiasIndexL;
			if (temperatureBiasIndexL > _temperatureBiasResolution - 1)
			{
				temperatureBiasIndexL = temperatureBiasIndexH = _temperatureBiasResolution - 1;
			}
			else if (temperatureBiasIndexH > _temperatureBiasResolution - 1)
			{
				temperatureBiasIndexH = _temperatureBiasResolution - 1;
			}
		}
		
		unsigned char temperatureBias = _temperatureBias[temperatureBiasIndexL] * (1 - temperatureBiasMultiplier) + _temperatureBias[temperatureBiasIndexH] * temperatureBiasMultiplier;
		
#if defined(IIntakeAirTemperatureServiceExists) && defined(IEngineCoolantTemperatureServiceExists)
		float temperature = (CurrentIntakeAirTemperatureService->IntakeAirTemperature * temperatureBias + CurrentEngineCoolantTemperatureService->EngineCoolantTemperature * (255 - temperatureBias))/255;
#elif defined(IIntakeAirTemperatureServiceExists)
		float temperature = CurrentIntakeAirTemperatureService->IntakeAirTemperature;
#elif defined(IEngineCoolantTemperatureServiceExists)
		float temperature = CurrentEngineCoolantTemperatureService->EngineCoolantTemperature;
#endif
		
		float airDensity = map / (_gasConstant * temperature);
		
		float airFuelRatio = CurrentAfrService->Afr;
		
		float injectorDuration = (cylinderVolume * airDensity) / (airFuelRatio + 0.78f/*density of fuel*/) * 60.0f / _injectorGramsPerMinute[cylinder];
		
		unsigned char mapDotIndexL = 0;
		unsigned char mapDotIndexH = 0;
		float mapDotMultiplier = 0;
		if (_mapDotAdderResolution > 1)
		{
			float mapDot = CurrentMapService->MapBarDot;
			float mapDotDivision = _maxMapBarDot / _mapDotAdderResolution;
			unsigned char mapDotIndexL = mapDot / mapDotDivision;
			unsigned char mapDotIndexH = mapDotIndexL + 1;
			float mapDotMultiplier = ((float)mapDot) / mapDotDivision - mapDotIndexL;
			if (mapDotIndexL > _mapDotAdderResolution - 1)
			{
				mapDotIndexL = mapDotIndexH = _mapDotAdderResolution - 1;
			}
			else if (mapDotIndexH > _mapDotAdderResolution - 1)
			{
				mapDotIndexH = _mapDotAdderResolution - 1;
			}
		}
		
		injectorDuration += (_mapDotAdder[mapDotIndexL] * (1 - mapDotMultiplier) + _mapDotAdder[mapDotIndexH] * mapDotMultiplier) * 0.000001f;
		
#ifdef ITpsServiceExists
		unsigned char tpsDotIndexL = 0;
		unsigned char tpsDotIndexH = 0;
		float tpsDotMultiplier = 0;
		if (_tpsDotAdderResolution > 1)
		{
			unsigned short tpsDot = CurrentThrottlePositionService->TpsDot;
			unsigned short tpsDotDivision = 1 / _tpsDotAdderResolution;
			tpsDotIndexL = tpsDot / tpsDotDivision;
			tpsDotIndexH = tpsDotIndexL + 1;
			tpsDotMultiplier = ((float)tpsDot) / tpsDotDivision - tpsDotIndexL;
			if (tpsDotIndexL > _tpsDotAdderResolution - 1)
			{
				tpsDotIndexL = tpsDotIndexH = _tpsDotAdderResolution - 1;
			}
			else if (tpsDotIndexH > _tpsDotAdderResolution - 1)
			{
				tpsDotIndexH = _tpsDotAdderResolution - 1;
			}
		}
		
		injectorDuration += (_tpsDotAdder[tpsDotIndexL] * (1 - tpsDotMultiplier) + _tpsDotAdder[tpsDotIndexH] * tpsDotMultiplier) * 0.000001f;
#endif
		
		if (injectorDuration <= 0) 
			return timing;
			
		if(injectorDuration < _shortPulseLimit)
		{
			unsigned short injectorDurationIndexL = 0;
			unsigned short injectorDurationIndexH = 0;
			float injectorDurationMultiplier = 0;
			unsigned short shortPulseResolution = (_shortPulseLimit / 0.00006f);
			if (shortPulseResolution > 1)
			{
				unsigned short injectorDurationDivision = _shortPulseLimit / (shortPulseResolution + 1);
				injectorDurationIndexL = injectorDuration / injectorDurationDivision;
				injectorDurationIndexH = injectorDurationIndexL + 1;
				injectorDurationMultiplier = ((float)injectorDuration) / injectorDurationDivision - injectorDurationIndexL;
				if (injectorDurationIndexL > shortPulseResolution)
				{
					injectorDurationIndexL = injectorDurationIndexH = shortPulseResolution;
				}
				else if (injectorDurationIndexH > shortPulseResolution)
				{
					injectorDurationIndexH = shortPulseResolution;
				}
			}
			
			injectorDuration += (_shortPulseAdder[injectorDurationIndexL] * (1 - injectorDurationMultiplier) + _shortPulseAdder[injectorDurationIndexH] * injectorDurationMultiplier) * 0.000001f;
		}
		
#ifdef IVoltageServiceExists
		float voltage = CurrentVoltageService->Voltage;
#else
		float voltage = 14;
#endif
		
		unsigned char voltageIndexL = 0;
		unsigned char voltageIndexH = 0;
		float voltageMultiplier = 0;
		if (_offsetVoltageResolution > 1)
		{
			float voltageDivision = (_voltageMax - _voltageMin) / _offsetVoltageResolution;
			voltageIndexL = ((voltage - _voltageMin) / voltageDivision);
			voltageIndexH = voltageIndexL + 1;
			voltageMultiplier = ((voltage - _voltageMin) / voltageDivision) - voltageIndexL;
			if (voltageIndexL > _offsetVoltageResolution - 1)
			{
				voltageIndexL = voltageIndexH = _offsetVoltageResolution - 1;
			}
			else if (voltageIndexH > _offsetVoltageResolution - 1)
			{
				voltageIndexH = _offsetVoltageResolution - 1;
			}
		}
		
		unsigned char mapOffsetIndexL = 0;
		unsigned char mapOffsetIndexH = 0;
		float mapOffsetMultiplier = 0;
		if (_offsetMapResolution > 1)
		{
			float mapOffsetDivision = _maxMapBar / _offsetMapResolution;
			mapOffsetIndexL = map / mapOffsetDivision;
			mapOffsetIndexH = mapOffsetIndexL + 1;
			mapOffsetMultiplier = ((float)map) / mapOffsetDivision - mapOffsetIndexL;
			if (mapOffsetIndexL > _offsetMapResolution - 1)
			{
				mapOffsetIndexL = mapOffsetIndexH = _offsetMapResolution - 1;
			}
			else if (mapOffsetIndexH > _offsetMapResolution - 1)
			{
				mapOffsetIndexH = _offsetMapResolution - 1;
			}
		}
		
		float offset =	(_offset[voltageIndexL + _offsetVoltageResolution * mapOffsetIndexL] * (1 - voltageMultiplier) * (1 - mapOffsetMultiplier)) * (1 / 1048576)
		+				_offset[voltageIndexH + _offsetVoltageResolution * mapOffsetIndexL] * voltageMultiplier * (1 - mapOffsetMultiplier)
		+				_offset[voltageIndexL + _offsetVoltageResolution * mapOffsetIndexH] * (1 - voltageMultiplier) * mapOffsetMultiplier
		+				_offset[voltageIndexH + _offsetVoltageResolution * mapOffsetIndexH] * voltageMultiplier * mapOffsetMultiplier;
		
		injectorDuration += offset;
				
		if (injectorDuration <= 0) 
			return timing;
		
		timing.PulseWidth = injectorDuration;
		return timing;
	}
}
#endif