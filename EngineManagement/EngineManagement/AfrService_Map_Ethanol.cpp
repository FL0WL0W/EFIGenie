#include "AfrService_Map_Ethanol.h"

#ifdef AFRSERVICE_MAP_ETHANOL_H
namespace ApplicationService
{
	AfrService_Map_Ethanol::AfrService_Map_Ethanol(
		const AfrService_Map_EthanolConfig *config,
		ITimerService *timerService, 
		IDecoder *decoder,
		IFloatInputService *manifoldAbsolutePressureService,
		IFloatInputService *engineCoolantTemperatureService,  
		IFloatInputService *ethanolContentService, 
		IFloatInputService *throttlePositionService)
	{
		_config = config;
		_timerService = timerService;
		_decoder = decoder;
		_manifoldAbsolutePressureService = manifoldAbsolutePressureService;
		_engineCoolantTemperatureService = engineCoolantTemperatureService;
		_ethanolContentService =  ethanolContentService;
		_throttlePositionService = throttlePositionService;
	}
	
	void AfrService_Map_Ethanol::CalculateAfr()
	{
		InterpolationResponse rpmInterpolation = Interpolate(_decoder->GetRpm(), _config->MaxRpm, 0, _config->AfrRpmResolution);
		InterpolationResponse mapInterpolation = Interpolate(_manifoldAbsolutePressureService->Value, _config->MaxMapBar, 0, _config->AfrMapResolution);
		
		float gasAfr = InterpolateTable2<unsigned short>(rpmInterpolation, _config->AfrRpmResolution, mapInterpolation, _config->GasMap) / 1024.0f;
		
		float ethanolAfr = gasAfr;
		if (_ethanolContentService != 0)
		{
			ethanolAfr = InterpolateTable2<unsigned short>(rpmInterpolation, _config->AfrRpmResolution, mapInterpolation, _config->EthanolMap) / 1024.0f;
		}
		
		float ectAfrMultiplier = 1;
		if (_engineCoolantTemperatureService != 0)
		{
			InterpolationResponse ectInterpolation = Interpolate(_engineCoolantTemperatureService->Value, _config->MaxEct, _config->MinEct, _config->AfrEctResolution);
			ectAfrMultiplier = InterpolateTable1<unsigned char>(ectInterpolation, _config->EctMultiplierTable) / 255;
		}

		InterpolationResponse tpsInterpolation = Interpolate(_throttlePositionService->Value, 1, 0, _config->AfrTpsResolution);
		
		float afr = gasAfr;
		float minAfrGas = InterpolateTable1<unsigned short>(tpsInterpolation, _config->TpsMinAfrGas) / 1024.0f;
		float minAfr = minAfrGas;
		
		if (_ethanolContentService != 0)
		{
			float minAfrEthanol =  InterpolateTable1<unsigned short>(tpsInterpolation, _config->TpsMinAfrEthanol) / 1024.0f;
			minAfr = minAfrEthanol * _ethanolContentService->Value + minAfrGas * (1 - _ethanolContentService->Value);
			afr = ((ethanolAfr * _ethanolContentService->Value + gasAfr * (1 - _ethanolContentService->Value)) * 0.0009765625) * ectAfrMultiplier;
		}
		
		unsigned int _tick =  _timerService->GetTick();
		if (!_started)
			_startupTick = _tick;
		else if (_tick > _config->StartupAfrDecay * _timerService->GetTicksPerSecond() - _startupTick)
			_aeDone =  true;
		_started = true;
		
		if (!_aeDone)
		{
			if (_tick < _config->StartupAfrDelay * _timerService->GetTicksPerSecond() - _startupTick)
				afr *= _config->StartupAfrMultiplier;
			else
				afr *= 1 - (1 - _config->StartupAfrMultiplier) * ((_config->StartupAfrDecay * _timerService->GetTicksPerSecond() - (_tick - _startupTick)) * 1.0f / (_config->StartupAfrDecay * _timerService->GetTicksPerSecond() - _config->StartupAfrDelay * _timerService->GetTicksPerSecond()));
		}
				
		if (minAfr > afr)
			Afr = afr;
		else
			Afr = minAfr;

		float stoich = InterpolateTable1<unsigned short>(_ethanolContentService->Value, 1, 0, _config->StoichResolution, _config->StoichTable) / 1024.0f;

		Lambda = Afr / stoich;
	}
}
#endif