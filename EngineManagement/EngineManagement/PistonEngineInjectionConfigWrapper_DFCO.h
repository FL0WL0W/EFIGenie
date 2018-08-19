#include "IPistonEngineInjectionConfig.h"
#include "IFloatInputService.h"
#include "IDecoder.h"
#include "Packed.h"

using namespace Decoder;
using namespace IOService;

#if !defined(PISTONENGINEINJECTIONCONFIGWRAPPER_DFCO_H) && defined(IPISTONENGINEINJECTIONCONFIG_H)
#define PISTONENGINEINJECTIONCONFIGWRAPPER_DFCO_H
namespace EngineManagement
{
	PACK(
	struct PistonEngineInjectionConfigWrapper_DFCOConfig
	{
	private:
		PistonEngineInjectionConfigWrapper_DFCOConfig()
		{

		}
	public:
		static PistonEngineInjectionConfigWrapper_DFCOConfig * Cast(void *p)
		{
			return (PistonEngineInjectionConfigWrapper_DFCOConfig *)p;
		}

		unsigned int Size()
		{
			return sizeof(PistonEngineInjectionConfigWrapper_DFCOConfig);
		}

		float TpsThreshold;
		unsigned short RpmEnable;
		unsigned short RpmDisable;
	});

	class PistonEngineInjectionConfigWrapper_DFCO : public IPistonEngineInjectionConfig
	{
	protected:
		PistonEngineInjectionConfigWrapper_DFCOConfig *_config;
		IFloatInputService *_throttlePositionService;
		IDecoder *_decoder;
		IPistonEngineInjectionConfig *_child;
		bool _dfcoEnabled;
	public:
		PistonEngineInjectionConfigWrapper_DFCO(PistonEngineInjectionConfigWrapper_DFCOConfig *config, IFloatInputService *throttlePositionService, IDecoder *decoder, IPistonEngineInjectionConfig *child);
		InjectorTiming GetInjectorTiming(unsigned char injector);
	};
}
#endif