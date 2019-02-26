#include "EngineControlServices/IgnitionService/IIgnitionConfig.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "Packed.h"

using namespace CrankCamDecoders;
using namespace IOServices;

#if !defined(IGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H) && defined(IIGNITIONCONFIG_H)
#define IGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H
namespace EngineControlServices
{
	PACK(
	struct IgnitionConfigWrapper_HardRpmLimitConfig
	{
	private:
		IgnitionConfigWrapper_HardRpmLimitConfig()
		{
			
		}
	public:
		const unsigned int Size() const
		{
			return sizeof(IgnitionConfigWrapper_HardRpmLimitConfig);
		}
		
		unsigned short RpmEnable;
		unsigned short RpmDisable;
	});
	
	class IgnitionConfigWrapper_HardRpmLimit : public IIgnitionConfig
	{
	protected:
		const IgnitionConfigWrapper_HardRpmLimitConfig *_config;
		ICrankCamDecoder *_decoder;
		IBooleanInputService *_booleanInputService;
		IIgnitionConfig *_child;
		bool _limitEnabled;
	public:
		IgnitionConfigWrapper_HardRpmLimit(const IgnitionConfigWrapper_HardRpmLimitConfig *config, ICrankCamDecoder *decoder, IBooleanInputService *booleanInputService, IIgnitionConfig *child);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif