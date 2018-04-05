#include "Services.h"
#include "PistonEngineConfig.h"
#include "AfrService_Map_Ethanol.h"

#ifdef AfrService_Map_EthanolExists
namespace EngineManagement
{
	AfrService_Map_Ethanol::AfrService_Map_Ethanol(const AfrService_Map_EthanolConfig *config)
	{
		_config = config;
	}
	
	void AfrService_Map_Ethanol::CalculateAfr()
	{
		unsigned char rpmIndexL = 0;
		unsigned char rpmIndexH = 0;
		float rpmMultiplier = 0;
		if (_config->AfrRpmResolution > 1)
		{
			unsigned short rpm = CurrentDecoder->GetRpm();
			unsigned short rpmDivision = _config->MaxRpm / (_config->AfrRpmResolution - 1);
			rpmIndexL = rpm / rpmDivision;
			rpmIndexH = rpmIndexL + 1;
			rpmMultiplier = ((float)rpm) / rpmDivision - rpmIndexL;
			if (rpmIndexL > _config->AfrRpmResolution - 1)
			{
				rpmIndexL = rpmIndexH = _config->AfrRpmResolution - 1;
			}
			else if (rpmIndexH > _config->AfrRpmResolution - 1)
			{
				rpmIndexH = _config->AfrRpmResolution - 1;
			}
		}

		unsigned char mapIndexL = 0;
		unsigned char mapIndexH = 0;
		float mapMultiplier = 0;
		if (_config->AfrMapResolution > 1)
		{
			float map = CurrentManifoldAbsolutePressureService->Value;
			float mapDivision = _config->MaxMapBar / (_config->AfrMapResolution - 1);
			mapIndexL = map / mapDivision;
			mapIndexH = mapIndexL + 1;
			mapMultiplier = ((float)map) / mapDivision - mapIndexL;
			if (mapIndexL > _config->AfrMapResolution - 1)
			{
				mapIndexL = mapIndexH = _config->AfrMapResolution - 1;
			}
			else if (mapIndexH > _config->AfrMapResolution - 1)
			{
				mapIndexH = _config->AfrMapResolution - 1;
			}
		}
		
		float gasAfr =	_config->GasMap[rpmIndexL + _config->AfrRpmResolution * mapIndexL] * (1 - rpmMultiplier) * (1 - mapMultiplier)
		+				_config->GasMap[rpmIndexH + _config->AfrRpmResolution * mapIndexL] * rpmMultiplier * (1 - mapMultiplier)
		+				_config->GasMap[rpmIndexL + _config->AfrRpmResolution * mapIndexH] * (1 - rpmMultiplier) * mapMultiplier
		+				_config->GasMap[rpmIndexH + _config->AfrRpmResolution * mapIndexH] * rpmMultiplier * mapMultiplier;
		
		float ethanolAfr = gasAfr;
		if (CurrentEthanolContentService != 0)
		{
			ethanolAfr =	_config->EthanolMap[rpmIndexL + _config->AfrRpmResolution * mapIndexL] * (1 - rpmMultiplier) * (1 - mapMultiplier)
			+				_config->EthanolMap[rpmIndexH + _config->AfrRpmResolution * mapIndexL] * rpmMultiplier * (1 - mapMultiplier)
			+				_config->EthanolMap[rpmIndexL + _config->AfrRpmResolution * mapIndexH] * (1 - rpmMultiplier) * mapMultiplier
			+				_config->EthanolMap[rpmIndexH + _config->AfrRpmResolution * mapIndexH] * rpmMultiplier * mapMultiplier;
		}
		
		float ectAfrMultiplier = 1;
		if (CurrentEngineCoolantTemperatureService != 0)
		{
			unsigned char ectIndexL = 0;
			unsigned char ectIndexH = 0;
			float ectMultiplier = 0;
			if (_config->AfrEctResolution > 1)
			{
				float ect = CurrentEngineCoolantTemperatureService->Value;
				float ectDivision = (_config->MaxEct - _config->MinEct) / (_config->AfrEctResolution - 1);
				ectIndexL = (ect - _config->MinEct) / ectDivision;
				ectIndexH = ectIndexL + 1;
				ectMultiplier = (ect - _config->MinEct) / ectDivision - ectIndexL;
				if (ectIndexL > _config->AfrEctResolution - 1)
				{
					ectIndexL = ectIndexH = _config->AfrEctResolution - 1;
				}
				else if (ectIndexH > _config->AfrEctResolution - 1)
				{
					ectIndexH = _config->AfrEctResolution - 1;
				}
			}
			ectAfrMultiplier = _config->EctMultiplierTable[ectIndexL] * (1 - ectMultiplier) + _config->EctMultiplierTable[ectIndexH] * ectMultiplier;
		}

		unsigned char tpsIndexL = 0;
		unsigned char tpsIndexH = 0;
		float tpsMultiplier = 0;
		if (_config->AfrTpsResolution > 1)
		{
			float tps = CurrentThrottlePositionService->Value;
			float tpsDivision = 1 / (_config->AfrTpsResolution - 1.0);
			tpsIndexL = tps / tpsDivision;
			tpsIndexH = tpsIndexL + 1;
			tpsMultiplier = tps / tpsDivision - tpsIndexL;
			if (tpsIndexL > _config->AfrTpsResolution - 1)
			{
				tpsIndexL = tpsIndexH = _config->AfrTpsResolution - 1;
			}
			else if (tpsIndexH > _config->AfrTpsResolution - 1)
			{
				tpsIndexH = _config->AfrTpsResolution - 1;
			}
		}
		
		float afr = gasAfr;
		float minAfrGas = (_config->TpsMinAfrGas[tpsIndexL] * (1 - tpsMultiplier) + _config->TpsMinAfrGas[tpsIndexH] * tpsMultiplier) / 1024.0f;
		float minAfr = minAfrGas;
		
		if (CurrentEthanolContentService != 0)
		{
			float minAfrEthanol = (_config->TpsMinAfrEthanol[tpsIndexL] * (1 - tpsMultiplier) + _config->TpsMinAfrEthanol[tpsIndexH] * tpsMultiplier) / 1024.0f;
			minAfr = minAfrEthanol * CurrentEthanolContentService->Value + minAfrGas * (1 - CurrentEthanolContentService->Value);
			afr = ((ethanolAfr * CurrentEthanolContentService->Value + gasAfr * (1 - CurrentEthanolContentService->Value)) * 0.0009765625) * ectAfrMultiplier;
		}
		
		unsigned int currentTick =  CurrentTimerService->GetTick();
		if (!_started)
			_startupTick = currentTick;
		else if (currentTick > _config->StartupAfrDecay * CurrentTimerService->GetTicksPerSecond() - _startupTick)
			_aeDone =  true;
		_started = true;
		
		if (!_aeDone)
		{
			if (currentTick < _config->StartupAfrDelay * CurrentTimerService->GetTicksPerSecond() - _startupTick)
				afr *= _config->StartupAfrMultiplier;
			else
				afr *= 1 - (1 - _config->StartupAfrMultiplier) * ((_config->StartupAfrDecay * CurrentTimerService->GetTicksPerSecond() - (currentTick - _startupTick)) * 1.0f / (_config->StartupAfrDecay * CurrentTimerService->GetTicksPerSecond() - _config->StartupAfrDelay * CurrentTimerService->GetTicksPerSecond()));
		}
				
		if (minAfr > afr)
			Afr = afr;
		else
			Afr = minAfr;

		unsigned char stoichIndexL = 0;
		unsigned char stoichIndexH = 0;
		float stoichMultiplier = 0;
		if (_config->StoichResolution > 1)
		{
			float ethanol = CurrentEthanolContentService->Value;
			float stoichDivision = 1 / (_config->StoichResolution - 1);
			stoichIndexL = ethanol / stoichDivision;
			stoichIndexH = stoichIndexL + 1;
			stoichMultiplier = ((float)ethanol) / stoichDivision - stoichIndexL;
			if (stoichIndexL > _config->StoichResolution - 1)
			{
				stoichIndexL = stoichIndexH = _config->StoichResolution - 1;
			}
			else if (stoichIndexH > _config->StoichResolution - 1)
			{
				stoichIndexH = _config->StoichResolution - 1;
			}
		}

		float stoich = (_config->StoichTable[stoichIndexL] * (1 - stoichMultiplier) + _config->StoichTable[stoichIndexH] * stoichMultiplier) * 0.0009765625;

		Lambda = Afr / stoich;
	}
}
#endif