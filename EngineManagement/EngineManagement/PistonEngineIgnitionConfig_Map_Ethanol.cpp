#include <map>
#include <functional>
#include "ITimerService.h"
#include "IIgnitorService.h"
#include "IInjectorService.h"
#include "IMapService.h"
#include "IEthanolService.h"
#include "IDecoder.h"
#include "IFuelTrimService.h"
#include "IEngineCoolantTemperatureService.h"
#include "IIntakeAirTemperatureService.h"
#include "IVoltageService.h"
#include "IAfrService.h"
#include "PistonEngineConfig.h"
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"


namespace EngineManagement
{
	PistonEngineIgnitionConfig_Map_Ethanol::PistonEngineIgnitionConfig_Map_Ethanol(
		Decoder::IDecoder *decoder, 
		IMapService *mapService,
		IEthanolService *ethanolService,
		IIntakeAirTemperatureService *iatService, 
		IEngineCoolantTemperatureService *ectService, 
		IVoltageService *voltageService, 
		IAfrService *afrService,
		PistonEngineConfig *pistonEngineConfig,
		void *config)
	{
		_decoder = decoder;
		_mapService = mapService;
		_ethanolService = ethanolService;
		_iatService = iatService;
		_ectService = ectService;
		_voltageService = voltageService;
		_afrService = afrService;
		_pistonEngineConfig = pistonEngineConfig;
		
		LoadConfig(config);
	}
	void PistonEngineIgnitionConfig_Map_Ethanol::LoadConfig(void *config)
	{
		_ignitionDwellTime = ((float *)config)[0];
		config = (void*)(((float *)config) + 1);
		
		_ignitionAdvanceMapGas = ((short *)config);
		config = (void*)(((short *)config) + (IGNITION_RPM_RESOLUTION * IGNITION_MAP_RESOLUTION));
		
		_ignitionAdvanceMapEthanol = ((short *)config);
		config = (void*)(((short *)config) + (IGNITION_RPM_RESOLUTION * IGNITION_MAP_RESOLUTION));
	}
				
	IgnitionTiming PistonEngineIgnitionConfig_Map_Ethanol::GetIgnitionTiming()
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
			
			short ignitionGas = _ignitionAdvanceMapGas[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * mapMultiplier
			+					_ignitionAdvanceMapGas[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
			+					_ignitionAdvanceMapGas[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
			+					_ignitionAdvanceMapGas[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
			
			short ignitionEthanol = _ignitionAdvanceMapEthanol[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * mapMultiplier
			+						_ignitionAdvanceMapEthanol[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * mapMultiplier
			+						_ignitionAdvanceMapEthanol[rpmIndexL + IGNITION_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * (1 - mapMultiplier)
			+						_ignitionAdvanceMapEthanol[rpmIndexH + IGNITION_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * (1 - mapMultiplier);
			
			IgnitionTiming timing = IgnitionTiming();
			timing.IgnitionAdvance64thDegree = ignitionEthanol * _ethanolService->EthanolContent + ignitionGas * (1 - _ethanolService->EthanolContent);
			timing.IgnitionDwellTime = _ignitionDwellTime;
		}
}