#include "IDecoder.h"
#include "IMapService.h"
#include "IEthanolService.h"
#include "IAfrService.h"
#include "PistonEngineConfig.h"
#include "AfrService_Map_Ethanol.h"

namespace EngineManagement
{
	AfrService_Map_Ethanol::AfrService_Map_Ethanol(Decoder::IDecoder *decoder, PistonEngineConfig *pistonEngineConfig, IMapService *mapService, IEthanolService *ethanolService, void *config)
	{
		_decoder = decoder;
		_mapService = mapService;
		_ethanolService = ethanolService;
		_pistonEngineConfig = pistonEngineConfig;
		LoadConfig(config);
	}
	
	void AfrService_Map_Ethanol::LoadConfig(void *config)
	{
		_maxRpm = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_maxMapKpa = *(float *)config;
		config = (void*)((float *)config + 1);
		
		_gasMap = (unsigned short *)config;// value in 1/1024
		config = (void*)((unsigned short *)config + AFR_RPM_RESOLUTION * AFR_MAP_RESOLUTION);
				
		_ethanolMap = (unsigned short *)config; // value in 1/1024
		config = (void*)((unsigned short *)config + AFR_RPM_RESOLUTION * AFR_MAP_RESOLUTION);
	}
	
	float AfrService_Map_Ethanol::GetAfr()
	{
		unsigned short rpm = _decoder->GetRpm();
		unsigned short rpmDivision = _maxRpm / AFR_RPM_RESOLUTION;
		unsigned char rpmIndexL = rpm / rpmDivision;
		unsigned char rpmIndexH = rpmIndexL + 1;
		float rpmMultiplier = ((float)rpm) / rpmDivision - rpmIndexL;
		if (rpmIndexL > AFR_RPM_RESOLUTION - 1)
		{
			rpmIndexL = rpmIndexH = AFR_RPM_RESOLUTION - 1;
		}
		else if (rpmIndexH > AFR_RPM_RESOLUTION - 1)
		{
			rpmIndexH = AFR_RPM_RESOLUTION - 1;
		}
		
		unsigned short map = _mapService->MapKpa;
		unsigned short mapDivision = _maxMapKpa / AFR_MAP_RESOLUTION;
		unsigned char mapIndexL = map / mapDivision;
		unsigned char mapIndexH = mapIndexL + 1;
		float mapMultiplier = ((float)map) / mapDivision - mapIndexL;
		if (mapIndexL > AFR_MAP_RESOLUTION - 1)
		{
			mapIndexL = mapIndexH = AFR_MAP_RESOLUTION - 1;
		}
		else if (mapIndexH > AFR_MAP_RESOLUTION - 1)
		{
			mapIndexH = AFR_MAP_RESOLUTION - 1;
		}
		
		float gasAfr =	_gasMap[rpmIndexL + AFR_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * (1 - mapMultiplier)
		+				_gasMap[rpmIndexH + AFR_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * (1 - mapMultiplier)
		+				_gasMap[rpmIndexL + AFR_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * mapMultiplier
		+				_gasMap[rpmIndexH + AFR_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * mapMultiplier;
		
		float ethanolAfr =	_ethanolMap[rpmIndexL + AFR_RPM_RESOLUTION * mapIndexL] * (1 - rpmMultiplier) * (1 - mapMultiplier)
		+					_ethanolMap[rpmIndexH + AFR_RPM_RESOLUTION * mapIndexL] * rpmMultiplier * (1 - mapMultiplier)
		+					_ethanolMap[rpmIndexL + AFR_RPM_RESOLUTION * mapIndexH] * (1 - rpmMultiplier) * mapMultiplier
		+					_ethanolMap[rpmIndexH + AFR_RPM_RESOLUTION * mapIndexH] * rpmMultiplier * mapMultiplier;
		
		return (ethanolAfr * _ethanolService->EthanolContent + gasAfr * (1 - _ethanolService->EthanolContent)) * 0.0009765625;
	}
}