#include "Services.h"
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"

#ifdef PistonEngineIgnitionConfig_Map_EthanolExists
namespace EngineManagement
{
	PistonEngineIgnitionConfig_Map_Ethanol::PistonEngineIgnitionConfig_Map_Ethanol(void *config)
	{		
		if (CurrentManifoldAbsolutePressureService == 0)
			return; //TODO: figure out error handling
		
		_maxRpm = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_maxMapBar = *(float *)config;
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
		unsigned char rpmIndexL = 0;
		unsigned char rpmIndexH = 0;
		float rpmMultiplier = 0;
		if (_ignitionRpmResolution > 1)
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
		}
			
		unsigned char mapIndexL = 0;
		unsigned char mapIndexH = 0;
		float mapMultiplier = 0;
		if (_ignitionMapResolution > 1)
		{
			unsigned short map = CurrentManifoldAbsolutePressureService->Value;
			unsigned short mapDivision = _maxMapBar / _ignitionMapResolution;
			mapIndexL = map / mapDivision;
			mapIndexH = mapIndexL + 1;
			mapMultiplier = (map + 0.0f) / mapDivision - mapIndexL;
			if (mapIndexL > _ignitionMapResolution - 1)
			{
				mapIndexL = mapIndexH = _ignitionMapResolution - 1;
			}
			else if (mapIndexH > _ignitionMapResolution - 1)
			{
				mapIndexH = _ignitionMapResolution - 1;
			}
		}
			
		short ignitionGas = _ignitionAdvanceMapGas[rpmIndexL + _ignitionRpmResolution * mapIndexL] * rpmMultiplier * mapMultiplier
		+					_ignitionAdvanceMapGas[rpmIndexH + _ignitionRpmResolution * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
		+					_ignitionAdvanceMapGas[rpmIndexL + _ignitionRpmResolution * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
		+					_ignitionAdvanceMapGas[rpmIndexH + _ignitionRpmResolution * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
			
		short ignitionEthanol = ignitionGas;
		if (CurrentEthanolContentService != 0)
		{
			ignitionEthanol = _ignitionAdvanceMapEthanol[rpmIndexL + _ignitionRpmResolution * mapIndexL] * rpmMultiplier * mapMultiplier
			+						_ignitionAdvanceMapEthanol[rpmIndexH + _ignitionRpmResolution * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
			+						_ignitionAdvanceMapEthanol[rpmIndexL + _ignitionRpmResolution * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
			+						_ignitionAdvanceMapEthanol[rpmIndexH + _ignitionRpmResolution * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
		}
			
		IgnitionTiming timing = IgnitionTiming();
		timing.IgnitionDwellTime = true;
		timing.IgnitionAdvance64thDegree = ignitionGas;
		if (CurrentEthanolContentService != 0)
			timing.IgnitionAdvance64thDegree = ignitionEthanol * CurrentEthanolContentService->Value + ignitionGas * (1 - CurrentEthanolContentService->Value);
		timing.IgnitionDwellTime = _ignitionDwellTime;
		return timing;
	}
}
#endif