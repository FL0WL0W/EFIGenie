#include "IPistonEngineIgnitionConfig.h"
#include "IDecoder.h"
#include "IBooleanInputService.h"
#include "ITimerService.h"
#include "Packed.h"

using namespace Decoder;
using namespace IOService;
using namespace HardwareAbstraction;

#if !defined(PISTONENGINEIGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H) && defined(IPISTONENGINEIGNITIONCONFIG_H)
#define PISTONENGINEIGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H
namespace EngineManagement
{
	PACK(
	struct PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig
	{
	private:
		PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig()
		{
			
		}
	public:
		static PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig *Cast(void *p)
		{
			return (PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig);
		}
		unsigned short RpmStart;
		unsigned short RpmLimit;
		float RpmKp;
		float RpmKi;
		float RpmKd;
	});
	
	class PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit : public IPistonEngineIgnitionConfig
	{
	protected:
		PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig *_config;
		ITimerService *_timerService;
		IDecoder *_decoder;
		IBooleanInputService *_booleanInputService;
		IPistonEngineIgnitionConfig *_child;
		
		unsigned short _prevError;
		unsigned int _prevRpmTime;
		float _integral;
	public:
		PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit(PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig * config, ITimerService *timerService, IDecoder *decoder, IBooleanInputService *booleanInputService, IPistonEngineIgnitionConfig *child);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif