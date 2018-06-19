#include "IBooleanOutputService.h"
#include "IPistonEngineIgnitionConfig.h"
#include "IPistonEngineInjectionConfig.h"
#include "IDecoder.h"
#include "ITimerService.h"
#include "IBooleanOutputService.h"
#include "Packed.h"

using namespace Decoder;
using namespace HardwareAbstraction;
using namespace IOService;

#if !defined(INJECTIONSCHEDULINGSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)  && defined(IDECODER_H) && (defined(IPISTONENGINEIGNITIONCONFIG_H)) ||  defined(IPISTONENGINEINJECTIONCONFIG_H)
#define INJECTIONSCHEDULINGSERVICE_H
namespace EngineManagement
{
	PACK(
	struct InjectionSchedulingServiceConfig
	{
	private:
		InjectionSchedulingServiceConfig()
		{

		}
	public:
		static InjectionSchedulingServiceConfig* Cast(void *p)
		{
			return (InjectionSchedulingServiceConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(InjectionSchedulingServiceConfig);
		}

		unsigned char Cylinders;
		bool IsThrottleBodyInjection;
	});

	class InjectionSchedulingService
	{
	protected:
		InjectionSchedulingServiceConfig *_injectionSchedulingServiceConfig;
		ITimerService *_timerService;
		IDecoder *_decoder;
		IPistonEngineInjectionConfig *_pistonEngineInjectionConfig;
		HardwareAbstraction::Task *_injectorOpenTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_injectorCloseTask[MAX_CYLINDERS];
	public:
		InjectionSchedulingService(
			InjectionSchedulingServiceConfig *injectionSchedulingServiceConfig,
			IPistonEngineInjectionConfig *pistonEngineInjectionConfig,
			IBooleanOutputService **injectorOutputServices,
			ITimerService *timerService,
			IDecoder *decoder);
		void ScheduleEvents(void);
	};
}
#endif