#include "EngineControlServices/IgnitionService/IIgnitionConfig.h"
#include "EngineControlServices/RpmService/RpmService.h"
#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "HardwareAbstraction/ITimerService.h"
#include "Packed.h"
#include "math.h"

using namespace Reluctor;
using namespace IOServices;
using namespace HardwareAbstraction;

#if !defined(IGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H) && defined(IIGNITIONCONFIG_H)
#define IGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H
namespace EngineControlServices
{
	PACK(
	struct IgnitionConfigWrapper_SoftPidRpmLimitConfig
	{
	private:
		IgnitionConfigWrapper_SoftPidRpmLimitConfig()
		{
			
		}
	public:
		const unsigned int Size() const
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
		const IgnitionConfigWrapper_SoftPidRpmLimitConfig *_config;
		ITimerService *_timerService;
		RpmService *_rpmService;
		IBooleanInputService *_booleanInputService;
		IIgnitionConfig *_child;
		
		unsigned short _prevError;
		unsigned int _prevRpmTime;
		float _integral;
	public:
		IgnitionConfigWrapper_SoftPidRpmLimit(const IgnitionConfigWrapper_SoftPidRpmLimitConfig * config, ITimerService *timerService, RpmService *rpmService, IBooleanInputService *booleanInputService, IIgnitionConfig *child);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif