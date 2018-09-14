#include "EngineManagementServices/IgnitionService/IIgnitionConfig.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "Packed.h"

using namespace CrankCamDecoders;
using namespace IOServices;

#if !defined(IGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H) && defined(IIGNITIONCONFIG_H)
#define IGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H
namespace EngineManagementServices
{
	PACK(
	struct IgnitionConfigWrapper_HardRpmLimitConfig
	{
	private:
		IgnitionConfigWrapper_HardRpmLimitConfig()
		{
			
		}
	public:
		static IgnitionConfigWrapper_HardRpmLimitConfig *Cast(void *p)
		{
			return (IgnitionConfigWrapper_HardRpmLimitConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(IgnitionConfigWrapper_HardRpmLimitConfig);
		}
		
		unsigned short RpmEnable;
		unsigned short RpmDisable;
	});
	
	class IgnitionConfigWrapper_HardRpmLimit : public IIgnitionConfig
	{
	protected:
		IgnitionConfigWrapper_HardRpmLimitConfig *_config;
		ICrankCamDecoder *_decoder;
		IBooleanInputService *_booleanInputService;
		IIgnitionConfig *_child;
		bool _limitEnabled;
	public:
		IgnitionConfigWrapper_HardRpmLimit(IgnitionConfigWrapper_HardRpmLimitConfig *config, ICrankCamDecoder *decoder, IBooleanInputService *booleanInputService, IIgnitionConfig *child);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif