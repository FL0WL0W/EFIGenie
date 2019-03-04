#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "EngineControlServices/InjectionService/IInjectionConfig.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "HardwareAbstraction/ITimerService.h"
#include "Packed.h"
#include "stdlib.h"
#include "math.h"

using namespace CrankCamDecoders;
using namespace HardwareAbstraction;
using namespace IOServices;

#if !defined(INJECTIONSCHEDULINGSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)  && defined(ICRANKCAMDECODER_H) && (defined(IIGNITIONCONFIG_H)) ||  defined(IINJECTIONCONFIG_H)
#define INJECTIONSCHEDULINGSERVICE_H
namespace EngineControlServices
{
	PACK(
	struct InjectionSchedulingServiceConfig
	{
	private:
		InjectionSchedulingServiceConfig()
		{

		}
	public:
		const unsigned int Size() const
		{
			return sizeof(InjectionSchedulingServiceConfig)
				+ sizeof(unsigned short) * Injectors;
		}
		const unsigned short *InjectorTdc() const { return (const unsigned short *)(this + 1); }

		unsigned char Injectors;
	});

	class InjectionSchedulingService
	{
	protected:
		const InjectionSchedulingServiceConfig *_injectionSchedulingServiceConfig;
		ITimerService *_timerService;
		ICrankCamDecoder *_decoder;
		IInjectionConfig *_injectionConfig;
		HardwareAbstraction::Task **_injectorOpenTask;
		HardwareAbstraction::Task **_injectorCloseTask;
	public:
		InjectionSchedulingService(
			const InjectionSchedulingServiceConfig *injectionSchedulingServiceConfig,
			IInjectionConfig *injectionConfig,
			IBooleanOutputService **injectorOutputServices,
			ITimerService *timerService,
			ICrankCamDecoder *decoder);
		void ScheduleEvents(void);

		static void ScheduleEventsCallBack(void *injectionSchedulingService);
	};
}
#endif