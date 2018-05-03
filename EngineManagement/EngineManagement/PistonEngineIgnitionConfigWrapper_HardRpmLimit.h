#include "IPistonEngineIgnitionConfig.h"
#include "IDecoder.h"
#include "IBooleanInputService.h"

using namespace Decoder;
using namespace IOService;

#if !defined(PISTONENGINEIGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H) && defined(IPISTONENGINEIGNITIONCONFIG_H)
#define PISTONENGINEIGNITIONCONFIGWRAPPER_HARDRPMLIMIT_H
namespace EngineManagement
{
	struct __attribute__((__packed__)) PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig
	{
	private:
		PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig()
		{
			
		}
	public:
		static PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig *Cast(void *p)
		{
			return (PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig);
		}
		
		unsigned short RpmEnable;
		unsigned short RpmDisable;
	};
	
	class PistonEngineIgnitionConfigWrapper_HardRpmLimit : public IPistonEngineIgnitionConfig
	{
	protected:
		PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig *_config;
		IDecoder *_decoder;
		IBooleanInputService *_booleanInputService;
		IPistonEngineIgnitionConfig *_child;
		bool _limitEnabled;
	public:
		PistonEngineIgnitionConfigWrapper_HardRpmLimit(PistonEngineIgnitionConfigWrapper_HardRpmLimitConfig *config, IDecoder *decoder, IBooleanInputService *booleanInputService, IPistonEngineIgnitionConfig *child);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif