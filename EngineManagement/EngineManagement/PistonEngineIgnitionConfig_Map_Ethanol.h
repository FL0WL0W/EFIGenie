#include "IPistonEngineIgnitionConfig.h"
#include "IDecoder.h"
#include "IFloatInputService.h"
#include "Interpolation.h"

using namespace Decoder;
using namespace IOService;
using namespace Interpolation;

#if !defined(PISTONENGINEIGNITIONCONFIG_MAP_ETHANOL_H) && defined(IPISTONENGINEIGNITIONCONFIG_H)
#define PISTONENGINEIGNITIONCONFIG_MAP_ETHANOL_H
namespace EngineManagement
{
	struct PistonEngineIgnitionConfig_Map_EthanolConfig
	{
	private:
		PistonEngineIgnitionConfig_Map_EthanolConfig()
		{
			
		}
	public:
		static PistonEngineIgnitionConfig_Map_EthanolConfig * Cast(void *p)
		{
			PistonEngineIgnitionConfig_Map_EthanolConfig *ret = (PistonEngineIgnitionConfig_Map_EthanolConfig *)p;

			ret->IgnitionAdvanceMapGas = (short *)(ret + 1);
			ret->IgnitionAdvanceMapEthanol = ret->IgnitionAdvanceMapGas + ret->IgnitionRpmResolution * ret->IgnitionMapResolution;

			return ret;
		}
		
		unsigned int Size()
		{
			return sizeof(PistonEngineIgnitionConfig_Map_EthanolConfig) +
				sizeof(short) * IgnitionRpmResolution * IgnitionMapResolution +
				sizeof(short) * IgnitionRpmResolution * IgnitionMapResolution;
		}
		
		float IgnitionDwellTime;
		
		unsigned short MaxRpm;
		float MaxMapBar;
		unsigned char IgnitionRpmResolution;
		unsigned char IgnitionMapResolution;
		short *IgnitionAdvanceMapGas;
		short *IgnitionAdvanceMapEthanol;
	};
	
	class PistonEngineIgnitionConfig_Map_Ethanol : public IPistonEngineIgnitionConfig
	{
	protected:
		PistonEngineIgnitionConfig_Map_EthanolConfig *_config;
		IDecoder *_decoder;
		IFloatInputService *_ethanolContentService;
		IFloatInputService *_manifoldAbsolutePressureService;
		
	public:
		PistonEngineIgnitionConfig_Map_Ethanol(PistonEngineIgnitionConfig_Map_EthanolConfig *config, IDecoder *decoder, IFloatInputService *ethanolContentService, IFloatInputService *manifoldAbsolutePressureService);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif