#include "EngineControlServices/IgnitionService/IIgnitionConfig.h"
#include "Reluctor/IReluctor.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "Interpolation.h"
#include "Packed.h"

using namespace Reluctor;
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
		const unsigned int Size() const
		{
			return sizeof(IgnitionConfig_Map_EthanolConfig) +
				sizeof(short) * IgnitionRpmResolution * IgnitionMapResolution +
				sizeof(short) * IgnitionRpmResolution * IgnitionMapResolution;
		}
		const short *IgnitionAdvanceMapGas() const { return (const short *)(this + 1); }
		const short *IgnitionAdvanceMapEthanol() const { return (const short *)(this + 1) + IgnitionRpmResolution * IgnitionMapResolution; }
		
		float IgnitionDwellTime;
		
		unsigned short MaxRpm;
		float MaxMapBar;
		unsigned char IgnitionRpmResolution;
		unsigned char IgnitionMapResolution;
	});
	
	class IgnitionConfig_Map_Ethanol : public IIgnitionConfig
	{
	protected:
		const IgnitionConfig_Map_EthanolConfig *_config;
		IReluctor *_reluctor;
		IFloatInputService *_ethanolContentService;
		IFloatInputService *_manifoldAbsolutePressureService;
		
	public:
		IgnitionConfig_Map_Ethanol(const IgnitionConfig_Map_EthanolConfig *config, IReluctor *reluctor, IFloatInputService *ethanolContentService, IFloatInputService *manifoldAbsolutePressureService);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif