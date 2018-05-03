#include "PistonEngineIgnitionConfig_Map_Ethanol.h"

#ifdef PISTONENGINEIGNITIONCONFIG_MAP_ETHANOL_H
namespace EngineManagement
{
	PistonEngineIgnitionConfig_Map_Ethanol::PistonEngineIgnitionConfig_Map_Ethanol(PistonEngineIgnitionConfig_Map_EthanolConfig *config, IDecoder *decoder, IFloatInputService *ethanolContentService, IFloatInputService *manifoldAbsolutePressureService)
	{
		_config = config;
		_decoder = decoder;
		_ethanolContentService = ethanolContentService;
		_manifoldAbsolutePressureService = manifoldAbsolutePressureService;
	}
				
	IgnitionTiming PistonEngineIgnitionConfig_Map_Ethanol::GetIgnitionTiming()
	{
		InterpolationResponse rpmInterpolation = Interpolate(_decoder->GetRpm(), _config->MaxRpm, 0, _config->IgnitionRpmResolution);
		InterpolationResponse mapInterpolation = Interpolate(_manifoldAbsolutePressureService->Value, _config->MaxMapBar, 0, _config->IgnitionMapResolution);
					
		short ignitionGas = InterpolateTable2<short>(rpmInterpolation, _config->IgnitionRpmResolution, mapInterpolation, _config->IgnitionAdvanceMapGas);
			
		short ignitionEthanol = ignitionGas;
		if (_ethanolContentService != 0)
		{
			ignitionEthanol = InterpolateTable2<short>(rpmInterpolation, _config->IgnitionRpmResolution, mapInterpolation, _config->IgnitionAdvanceMapEthanol);
		}
			
		IgnitionTiming timing = IgnitionTiming();
		timing.IgnitionDwellTime = true;
		timing.IgnitionAdvance64thDegree = ignitionGas;
		if (_ethanolContentService != 0)
			timing.IgnitionAdvance64thDegree = ignitionEthanol * _ethanolContentService->Value + ignitionGas * (1 - _ethanolContentService->Value);
		timing.IgnitionDwellTime = _config->IgnitionDwellTime;
		return timing;
	}
}
#endif