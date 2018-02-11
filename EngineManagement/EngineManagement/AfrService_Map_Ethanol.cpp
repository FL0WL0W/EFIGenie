#include "Services.h"
#include "PistonEngineConfig.h"
#include "AfrService_Map_Ethanol.h"

namespace EngineManagement
{
	AfrService_Map_Ethanol::AfrService_Map_Ethanol(void *config)
	{
		_maxRpm = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_maxMapKpa = *(float *)config;
		config = (void*)((float *)config + 1);
		
		_minEct = *(float *)config;
		config = (void*)((float *)config + 1);
		
		_maxEct = *(float *)config;
		config = (void*)((float *)config + 1);
		
		_afrRpmResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_afrMapResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_afrEctResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_afrTpsResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
				
		_gasMap = (unsigned short *)config; // value in 1/1024
		config = (void*)((unsigned short *)config + _afrRpmResolution * _afrMapResolution);
				
		_ethanolMap = (unsigned short *)config;  // value in 1/1024
		config = (void*)((unsigned short *)config + _afrRpmResolution * _afrMapResolution);
		
		_ectMultiplierTable = (float *)config;
		config = (void*)((float *)config + _afrEctResolution);
		
		_tpsMinAfr = (float *)config;
		config = (void*)((float *)config + _afrTpsResolution);
	}
	
	float AfrService_Map_Ethanol::GetAfr()
	{
		unsigned short rpm = CurrentDecoder->GetRpm();
		unsigned short rpmDivision = _maxRpm / _afrRpmResolution;
		unsigned char rpmIndexL = rpm / rpmDivision;
		unsigned char rpmIndexH = rpmIndexL + 1;
		float rpmMultiplier = ((float)rpm) / rpmDivision - rpmIndexL;
		if (rpmIndexL > _afrRpmResolution - 1)
		{
			rpmIndexL = rpmIndexH = _afrRpmResolution - 1;
		}
		else if (rpmIndexH > _afrRpmResolution - 1)
		{
			rpmIndexH = _afrRpmResolution - 1;
		}
		
		unsigned short map = CurrentMapService->MapKpa;
		unsigned short mapDivision = _maxMapKpa / _afrMapResolution;
		unsigned char mapIndexL = map / mapDivision;
		unsigned char mapIndexH = mapIndexL + 1;
		float mapMultiplier = ((float)map) / mapDivision - mapIndexL;
		if (mapIndexL > _afrMapResolution - 1)
		{
			mapIndexL = mapIndexH = _afrMapResolution - 1;
		}
		else if (mapIndexH > _afrMapResolution - 1)
		{
			mapIndexH = _afrMapResolution - 1;
		}
		
		float gasAfr =	_gasMap[rpmIndexL + _afrRpmResolution * mapIndexL] * (1 - rpmMultiplier) * (1 - mapMultiplier)
		+				_gasMap[rpmIndexH + _afrRpmResolution * mapIndexL] * rpmMultiplier * (1 - mapMultiplier)
		+				_gasMap[rpmIndexL + _afrRpmResolution * mapIndexH] * (1 - rpmMultiplier) * mapMultiplier
		+				_gasMap[rpmIndexH + _afrRpmResolution * mapIndexH] * rpmMultiplier * mapMultiplier;
		
		float ethanolAfr =	_ethanolMap[rpmIndexL + _afrRpmResolution * mapIndexL] * (1 - rpmMultiplier) * (1 - mapMultiplier)
		+					_ethanolMap[rpmIndexH + _afrRpmResolution * mapIndexL] * rpmMultiplier * (1 - mapMultiplier)
		+					_ethanolMap[rpmIndexL + _afrRpmResolution * mapIndexH] * (1 - rpmMultiplier) * mapMultiplier
		+					_ethanolMap[rpmIndexH + _afrRpmResolution * mapIndexH] * rpmMultiplier * mapMultiplier;
		
		float ect = CurrentEngineCoolantTemperatureService->EngineCoolantTemperature;
		float ectDivision = (_maxEct - _minEct) / _afrEctResolution;
		unsigned char ectIndexL = ect / ectDivision;
		unsigned char ectIndexH = ectIndexL + 1;
		float ectMultiplier = ect / ectDivision - ectIndexL;
		if (ectIndexL > _afrEctResolution - 1)
		{
			ectIndexL = ectIndexH = _afrEctResolution - 1;
		}
		else if (ectIndexH > _afrEctResolution - 1)
		{
			ectIndexH = _afrEctResolution - 1;
		}
				
		float ectAfrMultiplier = _ectMultiplierTable[ectIndexL] * (1 - ectMultiplier) + _ectMultiplierTable[ectIndexH] * ectMultiplier;
		
		float tps = CurrentThrottlePositionService->Tps;
		float tpsDivision = 1 / _afrTpsResolution;
		unsigned char tpsIndexL = tps / tpsDivision;
		unsigned char tpsIndexH = tpsIndexL + 1;
		float tpsMultiplier = tps / tpsDivision - tpsIndexL;
		if (tpsIndexL > _afrTpsResolution - 1)
		{
			tpsIndexL = tpsIndexH = _afrTpsResolution - 1;
		}
		else if (tpsIndexH > _afrTpsResolution - 1)
		{
			tpsIndexH = _afrTpsResolution - 1;
		}
		
		float minAfr = _tpsMinAfr[tpsIndexL] * (1 - tpsMultiplier) + _tpsMinAfr[tpsIndexH] * tpsMultiplier;
		
		float afr = ((ethanolAfr * CurrentEthanolService->EthanolContent + gasAfr * (1 - CurrentEthanolService->EthanolContent)) * 0.0009765625) * ectAfrMultiplier;
		
		if (minAfr < afr)
			return afr;
		
		return minAfr;
	}
}