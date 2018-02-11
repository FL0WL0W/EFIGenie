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
		
		_ignitionDwellTime = ((float *)config)[0];
		config = (void*)(((float *)config) + 1);
		
		_ignitionAdvanceMapGas = ((short *)config);
		config = (void*)(((short *)config) + (IGNITION_RPM_RESOLUTION * IGNITION_MAP_RESOLUTION));
		
		_ignitionAdvanceMapEthanol = ((short *)config);
		config = (void*)(((short *)config) + (IGNITION_RPM_RESOLUTION * IGNITION_MAP_RESOLUTION));
	}
				
	IgnitionTiming PistonEngineIgnitionConfig_Map_Ethanol::GetIgnitionTiming()
	{
		unsigned short rpm = CurrentDecoder->GetRpm();
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
			
		unsigned short map = CurrentMapService->MapKpa;
		unsigned short mapDivision = _maxMapKpa / IGNITION_MAP_RESOLUTION;
		unsigned char mapIndexL = map / mapDivision;
		unsigned char mapIndexH = mapIndexL + 1;
		float mapMultiplier = (map + 0.0f) / mapDivision - mapIndexL;
		if (mapIndexL > IGNITION_MAP_RESOLUTION - 1)
		{
			mapIndexL = mapIndexH = IGNITION_MAP_RESOLUTION - 1;
		}
		else if (mapIndexH > IGNITION_MAP_RESOLUTION - 1)
		{
			mapIndexH = IGNITION_MAP_RESOLUTION - 1;
		}
			
		short ignitionGas = _ignitionAdvanceMapGas[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * mapMultiplier
		+					_ignitionAdvanceMapGas[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
		+					_ignitionAdvanceMapGas[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
		+					_ignitionAdvanceMapGas[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
			
		short ignitionEthanol = _ignitionAdvanceMapEthanol[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * mapMultiplier
		+						_ignitionAdvanceMapEthanol[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
		+						_ignitionAdvanceMapEthanol[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
		+						_ignitionAdvanceMapEthanol[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
			
		IgnitionTiming timing = IgnitionTiming();
		timing.IgnitionDwellTime = true;
		timing.IgnitionAdvance64thDegree = ignitionEthanol * CurrentEthanolService->EthanolContent + ignitionGas * (1 - CurrentEthanolService->EthanolContent);
		timing.IgnitionDwellTime = _ignitionDwellTime;
		return timing;
	}
}