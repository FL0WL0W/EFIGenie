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
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionMapConfig.h"


namespace EngineManagement
{
	PistonEngineIgnitionMapConfig::PistonEngineIgnitionMapConfig(
		Decoder::IDecoder *decoder, 
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
		_iatService = iatService;
		_ectService = ectService;
		_voltageService = voltageService;
		_afrService = afrService;
		_pistonEngineConfig = pistonEngineConfig;
		
		LoadConfig(config);
	}
	void PistonEngineIgnitionMapConfig::LoadConfig(void *config)
	{
		_ignitionDwellTime = ((float *)config)[0];
		_ignitionAdvanceMap = ((short *)config) + 4;
	}
				
	IgnitionTiming PistonEngineIgnitionMapConfig::GetIgnitionTiming()
		{
			unsigned short rpm = _decoder->GetRpm();
			unsigned short rpmDivision = _pistonEngineConfig->MaxRpm / IGNITION_RPM_RESOLUTION;
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
				mapIndexL = mapIndexH = IGNITION_MAP_RESOLUTION - 1;
			}
			else if (mapIndexH > IGNITION_MAP_RESOLUTION - 1)
			{
				mapIndexH = IGNITION_MAP_RESOLUTION - 1;
			}
			
			IgnitionTiming timing = IgnitionTiming();
			timing.IgnitionAdvance64thDegree = _ignitionAdvanceMap[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * mapMultiplier
			+		_ignitionAdvanceMap[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
			+		_ignitionAdvanceMap[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
			+		_ignitionAdvanceMap[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
			timing.IgnitionDwellTime = _ignitionDwellTime;
		}
}