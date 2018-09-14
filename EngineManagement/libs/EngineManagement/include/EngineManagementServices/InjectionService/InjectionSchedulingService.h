#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "EngineManagementServices/InjectionService/IInjectionConfig.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "HardwareAbstraction/ITimerService.h"
#include "Packed.h"
#include "stdlib.h"

using namespace CrankCamDecoders;
using namespace HardwareAbstraction;
using namespace IOServices;

#if !defined(INJECTIONSCHEDULINGSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)  && defined(ICRANKCAMDECODER_H) && (defined(IIGNITIONCONFIG_H)) ||  defined(IINJECTIONCONFIG_H)
#define INJECTIONSCHEDULINGSERVICE_H
namespace EngineManagementServices
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
		ICrankCamDecoder *_decoder;
		IInjectionConfig *_injectionConfig;
		HardwareAbstraction::Task **_injectorOpenTask;
		HardwareAbstraction::Task **_injectorCloseTask;
	public:
		InjectionSchedulingService(
			InjectionSchedulingServiceConfig *injectionSchedulingServiceConfig,
			IInjectionConfig *injectionConfig,
			IBooleanOutputService **injectorOutputServices,
			ITimerService *timerService,
			ICrankCamDecoder *decoder);
		void ScheduleEvents(void);

		static void ScheduleEventsCallBack(void *injectionSchedulingService);
	};
}
#endif