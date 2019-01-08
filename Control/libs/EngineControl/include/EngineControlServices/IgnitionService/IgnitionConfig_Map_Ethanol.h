#include "EngineControlServices/IgnitionService/IIgnitionConfig.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "Interpolation.h"
#include "Packed.h"

using namespace CrankCamDecoders;
using namespace IOServices;
using namespace Interpolation;

#if !defined(IGNITIONCONFIG_MAP_ETHANOL_H) && defined(IIGNITIONCONFIG_H)
#define IGNITIONCONFIG_MAP_ETHANOL_H
namespace EngineControlServices
{
	PACK(
	struct IgnitionConfig_Map_EthanolConfig
	{
	private:
		IgnitionConfig_Map_EthanolConfig()
		{
			
		}
	public:
		static IgnitionConfig_Map_EthanolConfig * Cast(void *p)
		{
			IgnitionConfig_Map_EthanolConfig *ret = (IgnitionConfig_Map_EthanolConfig *)p;

			ret->IgnitionAdvanceMapGas = (short *)(ret + 1);
			ret->IgnitionAdvanceMapEthanol = ret->IgnitionAdvanceMapGas + ret->IgnitionRpmResolution * ret->IgnitionMapResolution;

			return ret;
		}
		
		unsigned int Size()
		{
			return sizeof(IgnitionConfig_Map_EthanolConfig) +
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
	});
	
	class IgnitionConfig_Map_Ethanol : public IIgnitionConfig
	{
	protected:
		IgnitionConfig_Map_EthanolConfig *_config;
		ICrankCamDecoder *_decoder;
		IFloatInputService *_ethanolContentService;
		IFloatInputService *_manifoldAbsolutePressureService;
		
	public:
		IgnitionConfig_Map_Ethanol(IgnitionConfig_Map_EthanolConfig *config, ICrankCamDecoder *decoder, IFloatInputService *ethanolContentService, IFloatInputService *manifoldAbsolutePressureService);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif