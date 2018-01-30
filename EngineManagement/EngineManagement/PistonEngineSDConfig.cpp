#include <map>
#include <functional>
#include "ITimerService.h"
#include "IIgnitionService.h"
#include "IInjectorService.h"
#include "IMapService.h"
#include "IDecoder.h"
#include "IFuelTrimService.h"
#include "IPistonEngineConfig.h"
#include "PistonEngineSDConfig.h"


namespace EngineManagement
{
	PistonEngineSDConfig::PistonEngineSDConfig(Decoder::IDecoder *decoder, IFuelTrimService *fuelTrimService, IMapService *mapService, void *config)
	{
		_decoder = decoder;
		_mapService = mapService;
		_fuelTrimService = fuelTrimService;
		
		LoadConfig(config);
	}
	void PistonEngineSDConfig::LoadConfig(void *config)
	{
		//void *config = EmbeddedResources::PistonEngineSDConfigFile_dat.data();
		Cylinders = ((uint8_t *)config)[0];
		_mlPerCylinder = ((uint16_t *)config)[1]; //left shifted 2
		_ignitionDwellTime10Us = ((uint16_t *)config)[2];
		_maxRpm = ((uint16_t *)config)[3];
		_injectorGramsPerMinute = (unsigned short *)(config) + 8;
		_shortPulseAdder = (short *)(_injectorGramsPerMinute) + (Cylinders << 1);//0-4ms, 60us increments
		_offset = _shortPulseAdder + (67 * 2);//8V to 16V in 0.5 increments
		_ignitionAdvanceMap = _offset + (VE_MAP_RESOLUTION * 32);
		_volumetricEfficiencyMap = ((unsigned short *)_ignitionAdvanceMap) + 2 * IGNITION_RPM_RESOLUTION * IGNITION_MAP_RESOLUTION;
	}
	
	unsigned int PistonEngineSDConfig::GetIgnitionDwellTime10Us()
	{
		return _ignitionDwellTime10Us;
	}
	
	int16_t PistonEngineSDConfig::GetIgnitionAdvance64thDegree()
	{
		unsigned short rpm = _decoder->GetRpm();
		unsigned short rpmDivision = _maxRpm / IGNITION_RPM_RESOLUTION;
		unsigned char rpmIndexL = rpm / rpmDivision;
		unsigned char rpmIndexH = rpmIndexL + 1;
		float rpmMultiplier = (rpm + 0.0f) / rpmDivision - rpmIndexL;
		if (rpmIndexL > IGNITION_RPM_RESOLUTION - 1)
		{
			rpmIndexL = rpmIndexH = IGNITION_RPM_RESOLUTION - 1;
		}
		else if (rpmIndexH > IGNITION_RPM_RESOLUTION - 1)
		{
			rpmIndexH = IGNITION_RPM_RESOLUTION - 1;
		}
		
		unsigned short map = _mapService->MapKpa;
		unsigned short mapDivision = _mapService->MaxMapKpa / IGNITION_MAP_RESOLUTION;
		unsigned char mapIndexL = map / mapDivision;
		unsigned char mapIndexH = mapIndexL + 1;
		float mapMultiplier = (map + 0.0f) / mapDivision - mapIndexL;
		if (mapIndexL > IGNITION_MAP_RESOLUTION - 1)
		{
			mapIndexL = rpmIndexH = IGNITION_MAP_RESOLUTION - 1;
		}
		else if (mapIndexH > IGNITION_MAP_RESOLUTION - 1)
		{
			mapIndexH = IGNITION_MAP_RESOLUTION - 1;
		}
		
		return	_ignitionAdvanceMap[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * mapMultiplier
		+		_ignitionAdvanceMap[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
		+		_ignitionAdvanceMap[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
		+		_ignitionAdvanceMap[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
	}
	
	InjectorTiming PistonEngineSDConfig::GetInjectorTiming(uint8_t cylinder)
	{
		unsigned short rpm = _decoder->GetRpm();
		unsigned short rpmDivision = _maxRpm / VE_RPM_RESOLUTION;
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
			mapIndexL = rpmIndexH = VE_MAP_RESOLUTION - 1;
		}
		else if (mapIndexH > VE_MAP_RESOLUTION - 1)
		{
			mapIndexH = VE_MAP_RESOLUTION - 1;
		}
		
		float VE =	_volumetricEfficiencyMap[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * mapMultiplier
		+			_volumetricEfficiencyMap[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
		+			_volumetricEfficiencyMap[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
		+			_volumetricEfficiencyMap[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
		
		VE *= 0.0078125;
		
		if (_fuelTrimService != NULL)
			VE += _fuelTrimService->GetFuelTrim(cylinder);
		float cylinderVolume = _mlPerCylinder / 8.0f * VE ;
		float airFuelRatio;
		float injectorDuration = cylinderVolume / (airFuelRatio + 1) * 60.0f / _injectorGramsPerMinute[cylinder];
		if (injectorDuration < 0.004f)
			injectorDuration += _shortPulseAdder[(int)(injectorDuration * 16666.666666666666666666666666667f)];
		injectorDuration += _offset[(int)mapKpaIndex];//+volt index
		InjectorTiming timing = InjectorTiming();
		timing.PulseWidth = injectorDuration;
		return timing;// { PulseWidthTick = injectorDuration ; }
	}
}