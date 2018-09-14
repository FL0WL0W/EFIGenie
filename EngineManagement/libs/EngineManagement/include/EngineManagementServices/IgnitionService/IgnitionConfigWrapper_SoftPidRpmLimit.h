#include "EngineManagementServices/IgnitionService/IIgnitionConfig.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "HardwareAbstraction/ITimerService.h"
#include "Packed.h"

using namespace CrankCamDecoders;
using namespace IOServices;
using namespace HardwareAbstraction;

#if !defined(IGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H) && defined(IIGNITIONCONFIG_H)
#define IGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H
namespace EngineManagementServices
{
	PACK(
	struct IgnitionConfigWrapper_SoftPidRpmLimitConfig
	{
	private:
		IgnitionConfigWrapper_SoftPidRpmLimitConfig()
		{
			
		}
	public:
		static IgnitionConfigWrapper_SoftPidRpmLimitConfig *Cast(void *p)
		{
			return (IgnitionConfigWrapper_SoftPidRpmLimitConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(IgnitionConfigWrapper_SoftPidRpmLimitConfig);
		}
		unsigned short RpmStart;
		unsigned short RpmLimit;
		float RpmKp;
		float RpmKi;
		float RpmKd;
	});
	
	class IgnitionConfigWrapper_SoftPidRpmLimit : public IIgnitionConfig
	{
	protected:
		IgnitionConfigWrapper_SoftPidRpmLimitConfig *_config;
		ITimerService *_timerService;
		ICrankCamDecoder *_decoder;
		IBooleanInputService *_booleanInputService;
		IIgnitionConfig *_child;
		
		unsigned short _prevError;
		unsigned int _prevRpmTime;
		float _integral;
	public:
		IgnitionConfigWrapper_SoftPidRpmLimit(IgnitionConfigWrapper_SoftPidRpmLimitConfig * config, ITimerService *timerService, ICrankCamDecoder *decoder, IBooleanInputService *booleanInputService, IIgnitionConfig *child);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif