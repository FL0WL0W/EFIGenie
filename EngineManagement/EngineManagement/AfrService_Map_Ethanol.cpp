#include "Interpolation.h"
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
		InterpolationResponse rpmInterpolation = Interpolate(CurrentDecoder->GetRpm(), _config->MaxRpm, 0, _config->AfrRpmResolution);
		InterpolationResponse mapInterpolation = Interpolate(CurrentManifoldAbsolutePressureService->Value, _config->MaxMapBar, 0, _config->AfrMapResolution);
		
		float gasAfr = InterpolateTable2<unsigned short>(rpmInterpolation, _config->AfrRpmResolution, mapInterpolation, _config->GasMap) / 1024.0f;
		
		float ethanolAfr = gasAfr;
		if (CurrentEthanolContentService != 0)
		{
			ethanolAfr = InterpolateTable2<unsigned short>(rpmInterpolation, _config->AfrRpmResolution, mapInterpolation, _config->EthanolMap) / 1024.0f;
		}
		
		float ectAfrMultiplier = 1;
		if (CurrentEngineCoolantTemperatureService != 0)
		{
			InterpolationResponse ectInterpolation = Interpolate(CurrentEngineCoolantTemperatureService->Value, _config->MaxEct, _config->MinEct, _config->AfrEctResolution);
			ectAfrMultiplier = InterpolateTable1<unsigned char>(ectInterpolation, _config->EctMultiplierTable) / 255;
		}

		InterpolationResponse tpsInterpolation = Interpolate(CurrentThrottlePositionService->Value, 1, 0, _config->AfrTpsResolution);
		
		float afr = gasAfr;
		float minAfrGas = InterpolateTable1<unsigned short>(tpsInterpolation, _config->TpsMinAfrGas) / 1024.0f;
		float minAfr = minAfrGas;
		
		if (CurrentEthanolContentService != 0)
		{
			float minAfrEthanol =  InterpolateTable1<unsigned short>(tpsInterpolation, _config->TpsMinAfrEthanol) / 1024.0f;
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

		float stoich = InterpolateTable1<unsigned short>(CurrentEthanolContentService->Value, 1, 0, _config->StoichResolution, _config->StoichTable);

		Lambda = Afr / stoich;
	}
}
#endif