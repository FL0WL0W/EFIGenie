#include "Services.h"
#include "PistonEngineConfig.h"
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"


namespace EngineManagement
{
	PistonEngineIgnitionConfig_Map_Ethanol::PistonEngineIgnitionConfig_Map_Ethanol(
		PistonEngineConfig *pistonEngineConfig,
		void *config)
	{
		_pistonEngineConfig = pistonEngineConfig;
		
		_maxRpm = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_maxMapKpa = *(float *)config;
		config = (void*)((float *)config + 1);
		
		_ignitionRpmResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_ignitionMapResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_ignitionDwellTime = ((float *)config)[0];
		config = (void*)(((float *)config) + 1);
		
		_ignitionAdvanceMapGas = ((short *)config);
		config = (void*)(((short *)config) + (_ignitionRpmResolution * _ignitionMapResolution));
		
		_ignitionAdvanceMapEthanol = ((short *)config);
		config = (void*)(((short *)config) + (_ignitionRpmResolution * _ignitionMapResolution));
	}
				
	IgnitionTiming PistonEngineIgnitionConfig_Map_Ethanol::GetIgnitionTiming()
	{
		unsigned short rpm = CurrentDecoder->GetRpm();
		unsigned short rpmDivision = _maxRpm / _ignitionRpmResolution;
		unsigned char rpmIndexL = rpm / rpmDivision;
		unsigned char rpmIndexH = rpmIndexL + 1;
		float rpmMultiplier = (rpm + 0.0f) / rpmDivision - rpmIndexL;
		if (rpmIndexL > _ignitionRpmResolution - 1)
		{
			rpmIndexL = rpmIndexH = _ignitionRpmResolution - 1;
		}
		else if (rpmIndexH > _ignitionRpmResolution - 1)
		{
			rpmIndexH = _ignitionRpmResolution - 1;
		}
			
		unsigned short map = CurrentMapService->MapKpa;
		unsigned short mapDivision = _maxMapKpa / _ignitionMapResolution;
		unsigned char mapIndexL = map / mapDivision;
		unsigned char mapIndexH = mapIndexL + 1;
		float mapMultiplier = (map + 0.0f) / mapDivision - mapIndexL;
		if (mapIndexL > _ignitionMapResolution - 1)
		{
			mapIndexL = mapIndexH = _ignitionMapResolution - 1;
		}
		else if (mapIndexH > _ignitionMapResolution - 1)
		{
			mapIndexH = _ignitionMapResolution - 1;
		}
			
		short ignitionGas = _ignitionAdvanceMapGas[rpmIndexL + _ignitionRpmResolution * mapIndexL] * rpmMultiplier * mapMultiplier
		+					_ignitionAdvanceMapGas[rpmIndexH + _ignitionRpmResolution * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
		+					_ignitionAdvanceMapGas[rpmIndexL + _ignitionRpmResolution * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
		+					_ignitionAdvanceMapGas[rpmIndexH + _ignitionRpmResolution * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
			
		short ignitionEthanol = _ignitionAdvanceMapEthanol[rpmIndexL + _ignitionRpmResolution * mapIndexL] * rpmMultiplier * mapMultiplier
		+						_ignitionAdvanceMapEthanol[rpmIndexH + _ignitionRpmResolution * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
		+						_ignitionAdvanceMapEthanol[rpmIndexL + _ignitionRpmResolution * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
		+						_ignitionAdvanceMapEthanol[rpmIndexH + _ignitionRpmResolution * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
			
		IgnitionTiming timing = IgnitionTiming();
		timing.IgnitionDwellTime = true;
		timing.IgnitionAdvance64thDegree = ignitionEthanol * CurrentEthanolService->EthanolContent + ignitionGas * (1 - CurrentEthanolService->EthanolContent);
		timing.IgnitionDwellTime = _ignitionDwellTime;
		return timing;
	}
}