#include "Services.h"
#include "PistonEngineConfig.h"
#include "AfrService_Map_Ethanol.h"

#ifdef AfrService_Map_EthanolExists
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

		_stoichResolution = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
				
		_stoichTable = (unsigned short *)config; // value in 1/1024
		config = (void*)((unsigned short *)config + _stoichResolution);

		_gasMap = (unsigned short *)config; // value in 1/1024
		config = (void*)((unsigned short *)config + _afrRpmResolution * _afrMapResolution);
				
		_ethanolMap = (unsigned short *)config;  // value in 1/1024
		config = (void*)((unsigned short *)config + _afrRpmResolution * _afrMapResolution);
		
		_ectMultiplierTable = (float *)config;
		config = (void*)((float *)config + _afrEctResolution);

		_tpsMinAfrGas = (unsigned short *)config;
		config = (void*)((unsigned short *)config + _afrTpsResolution);

		_tpsMinAfrEthanol = (unsigned short *)config;
		config = (void*)((unsigned short *)config + _afrTpsResolution);
		
		_startupAfrMultiplier = *(float *)config;
		config = (void*)((float *)config + 1);
		
		unsigned int tickPerSecond = CurrentTimerService->GetTicksPerSecond();
		
		_startupAfrTickDelay = (*(float *)config) * tickPerSecond;
		config = (void*)((float *)config + 1);
				
		_startupAfrTickDecay = (*(float *)config) * tickPerSecond;
		config = (void*)((float *)config + 1);
	}
	
	float AfrService_Map_Ethanol::GetAfr()
	{
		unsigned char rpmIndexL = 0;
		unsigned char rpmIndexH = 0;
		float rpmMultiplier = 0;
		if (_afrRpmResolution > 1)
		{
			unsigned short rpm = CurrentDecoder->GetRpm();
			unsigned short rpmDivision = _maxRpm / (_afrRpmResolution - 1);
			rpmIndexL = rpm / rpmDivision;
			rpmIndexH = rpmIndexL + 1;
			rpmMultiplier = ((float)rpm) / rpmDivision - rpmIndexL;
			if (rpmIndexL > _afrRpmResolution - 1)
			{
				rpmIndexL = rpmIndexH = _afrRpmResolution - 1;
			}
			else if (rpmIndexH > _afrRpmResolution - 1)
			{
				rpmIndexH = _afrRpmResolution - 1;
			}
		}

		unsigned char mapIndexL = 0;
		unsigned char mapIndexH = 0;
		float mapMultiplier = 0;
		if (_afrMapResolution > 1)
		{
			unsigned short map = CurrentMapService->MapKpa;
			unsigned short mapDivision = _maxMapKpa / (_afrMapResolution - 1);
			mapIndexL = map / mapDivision;
			mapIndexH = mapIndexL + 1;
			mapMultiplier = ((float)map) / mapDivision - mapIndexL;
			if (mapIndexL > _afrMapResolution - 1)
			{
				mapIndexL = mapIndexH = _afrMapResolution - 1;
			}
			else if (mapIndexH > _afrMapResolution - 1)
			{
				mapIndexH = _afrMapResolution - 1;
			}
		}
		
		float gasAfr =	_gasMap[rpmIndexL + _afrRpmResolution * mapIndexL] * (1 - rpmMultiplier) * (1 - mapMultiplier)
		+				_gasMap[rpmIndexH + _afrRpmResolution * mapIndexL] * rpmMultiplier * (1 - mapMultiplier)
		+				_gasMap[rpmIndexL + _afrRpmResolution * mapIndexH] * (1 - rpmMultiplier) * mapMultiplier
		+				_gasMap[rpmIndexH + _afrRpmResolution * mapIndexH] * rpmMultiplier * mapMultiplier;
		
		float ethanolAfr =	_ethanolMap[rpmIndexL + _afrRpmResolution * mapIndexL] * (1 - rpmMultiplier) * (1 - mapMultiplier)
		+					_ethanolMap[rpmIndexH + _afrRpmResolution * mapIndexL] * rpmMultiplier * (1 - mapMultiplier)
		+					_ethanolMap[rpmIndexL + _afrRpmResolution * mapIndexH] * (1 - rpmMultiplier) * mapMultiplier
		+					_ethanolMap[rpmIndexH + _afrRpmResolution * mapIndexH] * rpmMultiplier * mapMultiplier;
		
#ifdef IEngineCoolantTemperatureServiceExists
		unsigned char ectIndexL = 0;
		unsigned char ectIndexH = 0;
		float ectMultiplier = 0;
		if (_afrEctResolution > 1)
		{
			float ect = CurrentEngineCoolantTemperatureService->EngineCoolantTemperature;
			float ectDivision = (_maxEct - _minEct) / (_afrEctResolution - 1);
			ectIndexL = (ect - _minEct) / ectDivision;
			ectIndexH = ectIndexL + 1;
			ectMultiplier = (ect - _minEct) / ectDivision - ectIndexL;
			if (ectIndexL > _afrEctResolution - 1)
			{
				ectIndexL = ectIndexH = _afrEctResolution - 1;
			}
			else if (ectIndexH > _afrEctResolution - 1)
			{
				ectIndexH = _afrEctResolution - 1;
			}
		}
				
		float ectAfrMultiplier = _ectMultiplierTable[ectIndexL] * (1 - ectMultiplier) + _ectMultiplierTable[ectIndexH] * ectMultiplier;
#else
		float ectAfrMultiplier = 1l;
#endif

		unsigned char tpsIndexL = 0;
		unsigned char tpsIndexH = 0;
		float tpsMultiplier = 0;
		if (_afrTpsResolution > 1)
		{
			float tps = CurrentThrottlePositionService->Tps;
			float tpsDivision = 1 / (_afrTpsResolution - 1.0);
			tpsIndexL = tps / tpsDivision;
			tpsIndexH = tpsIndexL + 1;
			tpsMultiplier = tps / tpsDivision - tpsIndexL;
			if (tpsIndexL > _afrTpsResolution - 1)
			{
				tpsIndexL = tpsIndexH = _afrTpsResolution - 1;
			}
			else if (tpsIndexH > _afrTpsResolution - 1)
			{
				tpsIndexH = _afrTpsResolution - 1;
			}
		}
		
		float minAfr = ((_tpsMinAfrEthanol[tpsIndexL] * (1 - tpsMultiplier) + _tpsMinAfrEthanol[tpsIndexH] * tpsMultiplier) * CurrentEthanolService->EthanolContent + (_tpsMinAfrGas[tpsIndexL] * (1 - tpsMultiplier) + _tpsMinAfrGas[tpsIndexH] * tpsMultiplier) * (1 - CurrentEthanolService->EthanolContent))/1024.0f;
		
		float afr = ((ethanolAfr * CurrentEthanolService->EthanolContent + gasAfr * (1 - CurrentEthanolService->EthanolContent)) * 0.0009765625) * ectAfrMultiplier;
		
		unsigned int currentTick =  CurrentTimerService->GetTick();
		if (!_started)
			_startupTick = currentTick;
		else if (currentTick > _startupAfrTickDecay - _startupTick)
			_aeDone =  true;
		_started = true;
		
		if (!_aeDone)
		{
			if (currentTick < _startupAfrTickDelay - _startupTick)
				afr *= _startupAfrMultiplier;
			else
				afr *= 1 - (1 - _startupAfrMultiplier) * ((_startupAfrTickDecay - (currentTick - _startupTick)) * 1.0f / (_startupAfrTickDecay - _startupAfrTickDelay));
		}
				
		if (minAfr > afr)
			return afr;
		
		return minAfr;
	}

	float AfrService_Map_Ethanol::GetLambda()
	{
		unsigned char stoichIndexL = 0;
		unsigned char stoichIndexH = 0;
		float stoichMultiplier = 0;
		if (_stoichResolution > 1)
		{
			float ethanol = CurrentEthanolService->EthanolContent;
			float stoichDivision = 1 / (_stoichResolution - 1);
			stoichIndexL = ethanol / stoichDivision;
			stoichIndexH = stoichIndexL + 1;
			stoichMultiplier = ((float)ethanol) / stoichDivision - stoichIndexL;
			if (stoichIndexL > _stoichResolution - 1)
			{
				stoichIndexL = stoichIndexH = _stoichResolution - 1;
			}
			else if (stoichIndexH > _stoichResolution - 1)
			{
				stoichIndexH = _stoichResolution - 1;
			}
		}

		float stoich = (_stoichTable[stoichIndexL] * (1 - stoichMultiplier) + _stoichTable[stoichIndexH] * stoichMultiplier) * 0.0009765625;

		return GetAfr() / stoich;
	}
}
#endif