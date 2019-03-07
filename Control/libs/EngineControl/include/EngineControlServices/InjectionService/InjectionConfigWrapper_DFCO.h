#include "EngineControlServices/InjectionService/IInjectionConfig.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "EngineControlServices/RpmService/RpmService.h"
#include "Packed.h"

using namespace Reluctor;
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
		constexpr const unsigned int Size() const
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
		const InjectionConfigWrapper_DFCOConfig *_config;
		IFloatInputService *_throttlePositionService;
		RpmService *_rpmService;
		IInjectionConfig *_child;
		bool _dfcoEnabled;
	public:
		InjectionConfigWrapper_DFCO(const InjectionConfigWrapper_DFCOConfig *config, IFloatInputService *throttlePositionService, RpmService *rpmService, IInjectionConfig *child);
		InjectorTiming GetInjectorTiming(unsigned char injector);
	};
}
#endif