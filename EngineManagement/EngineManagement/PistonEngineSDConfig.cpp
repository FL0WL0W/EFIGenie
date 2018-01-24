#include <map>
#include <functional>
#include "ITimerService.h"
#include "MicroRtos.h"
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
		//no interpolation
		uint8_t rpmIndex = (_decoder->GetRpm() + _maxRpm * (0.5 / (IGNITION_RPM_RESOLUTION - 1))) / (_maxRpm * (1 / (IGNITION_RPM_RESOLUTION - 1)));
		if (rpmIndex > IGNITION_RPM_RESOLUTION - 1)
			rpmIndex = IGNITION_RPM_RESOLUTION - 1;
		float mapKpa = _mapService->MapKpa;
		uint8_t mapKpaIndex = (uint8_t)((mapKpa + _mapService->MaxMapKpa*(0.5 / (IGNITION_MAP_RESOLUTION - 1))) / (_mapService->MaxMapKpa*(1 / (IGNITION_MAP_RESOLUTION - 1))));
		if (mapKpaIndex > IGNITION_MAP_RESOLUTION - 1)
			mapKpaIndex = IGNITION_MAP_RESOLUTION - 1;
		return _ignitionAdvanceMap[rpmIndex + IGNITION_RPM_RESOLUTION * mapKpaIndex];
	}
	
	InjectorTiming PistonEngineSDConfig::GetInjectorTiming(uint8_t cylinder)
	{
		//no interpolation
		uint8_t rpmIndex = (_decoder->GetRpm() + _maxRpm * (0.5 / (VE_RPM_RESOLUTION - 1))) / (_maxRpm * (1 / (VE_RPM_RESOLUTION - 1)));
		if (rpmIndex > VE_RPM_RESOLUTION - 1)
			rpmIndex = VE_RPM_RESOLUTION - 1;
		float mapKpa = _mapService->MapKpa;
		uint8_t mapKpaIndex = (uint8_t)((mapKpa + _mapService->MaxMapKpa*(0.5 / (VE_MAP_RESOLUTION - 1))) / (_mapService->MaxMapKpa*(1 / (VE_MAP_RESOLUTION - 1))));
		if (mapKpaIndex > VE_MAP_RESOLUTION - 1)
			mapKpaIndex = VE_MAP_RESOLUTION - 1;
		//uint16_t *volumetricEfficiency = (uint16_t *)EmbeddedResources::VolumetricEfficiencyFile_dat.data();
		float VE = _volumetricEfficiencyMap[rpmIndex + VE_RPM_RESOLUTION * mapKpaIndex] / 128.0f;
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