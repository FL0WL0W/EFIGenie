#include "IBooleanOutputService.h"
#include "IPistonEngineIgnitionConfig.h"
#include "IPistonEngineInjectionConfig.h"
#include "IDecoder.h"
#include "ITimerService.h"
#include "IBooleanOutputService.h"
#include "Packed.h"
#include "stdlib.h"

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
			InjectionSchedulingServiceConfig *injectorService = (InjectionSchedulingServiceConfig *)p;

			injectorService->InjectorTdc = (unsigned short*)(injectorService + 1);

			return injectorService;
		}
		unsigned int Size()
		{
			return sizeof(InjectionSchedulingServiceConfig)
				+ sizeof(unsigned short) * Injectors;
		}

		unsigned char Injectors;
		unsigned short *InjectorTdc;
	});

	class InjectionSchedulingService
	{
	protected:
		InjectionSchedulingServiceConfig *_injectionSchedulingServiceConfig;
		ITimerService *_timerService;
		IDecoder *_decoder;
		IPistonEngineInjectionConfig *_pistonEngineInjectionConfig;
		HardwareAbstraction::Task **_injectorOpenTask;
		HardwareAbstraction::Task **_injectorCloseTask;
	public:
		InjectionSchedulingService(
			InjectionSchedulingServiceConfig *injectionSchedulingServiceConfig,
			IPistonEngineInjectionConfig *pistonEngineInjectionConfig,
			IBooleanOutputService **injectorOutputServices,
			ITimerService *timerService,
			IDecoder *decoder);
		void ScheduleEvents(void);

		static void ScheduleEventsCallBack(void *injectionSchedulingService);
	};
}
#endif