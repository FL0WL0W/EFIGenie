#include "EngineControlServices/InjectionService/IInjectionConfig.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "Packed.h"

using namespace CrankCamDecoders;
using namespace IOServices;

#if !defined(INJECTIONCONFIGWRAPPER_DFCO_H) && defined(IINJECTIONCONFIG_H)
#define INJECTIONCONFIGWRAPPER_DFCO_H
namespace EngineControlServices
{
	PACK(
	struct InjectionConfigWrapper_DFCOConfig
	{
	private:
		InjectionConfigWrapper_DFCOConfig()
		{

		}
	public:
		static InjectionConfigWrapper_DFCOConfig * Cast(void *p)
		{
			return (InjectionConfigWrapper_DFCOConfig *)p;
		}

		unsigned int Size()
		{
			return sizeof(InjectionConfigWrapper_DFCOConfig);
		}

		float TpsThreshold;
		unsigned short RpmEnable;
		unsigned short RpmDisable;
	});

	class InjectionConfigWrapper_DFCO : public IInjectionConfig
	{
	protected:
		InjectionConfigWrapper_DFCOConfig *_config;
		IFloatInputService *_throttlePositionService;
		ICrankCamDecoder *_decoder;
		IInjectionConfig *_child;
		bool _dfcoEnabled;
	public:
		InjectionConfigWrapper_DFCO(InjectionConfigWrapper_DFCOConfig *config, IFloatInputService *throttlePositionService, ICrankCamDecoder *decoder, IInjectionConfig *child);
		InjectorTiming GetInjectorTiming(unsigned char injector);
	};
}
#endif