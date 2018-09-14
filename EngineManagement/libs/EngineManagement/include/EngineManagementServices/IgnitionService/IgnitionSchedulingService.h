#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "EngineManagementServices/IgnitionService/IIgnitionConfig.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "HardwareAbstraction/ITimerService.h"
#include "Packed.h"
#include "stdlib.h"

using namespace CrankCamDecoders;
using namespace HardwareAbstraction;
using namespace IOServices;

#if !defined(IGNITIONSCHEDULINGSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)  && defined(ICRANKCAMDECODER_H) && (defined(IIGNITIONCONFIG_H)) ||  defined(IINJECTIONCONFIG_H)
#define IGNITIONSCHEDULINGSERVICE_H
namespace EngineManagementServices
{
	PACK(
	struct IgnitionSchedulingServiceConfig
	{
	private:
		IgnitionSchedulingServiceConfig()
		{

		}
	public:
		static IgnitionSchedulingServiceConfig* Cast(void *p)
		{
			IgnitionSchedulingServiceConfig *ignitorService = (IgnitionSchedulingServiceConfig *)p;

			ignitorService->IgnitorTdc = (unsigned short*)(ignitorService + 1);

			return ignitorService;
		}
		unsigned int Size()
		{
			return sizeof(IgnitionSchedulingServiceConfig)
				+ sizeof(unsigned short) * Ignitors;
		}

		bool SequentialRequired;
		unsigned char Ignitors;
		unsigned short *IgnitorTdc;
	});

	class IgnitionSchedulingService
	{
	protected:
		IgnitionSchedulingServiceConfig *_ignitionSchedulingServiceConfig;
		ITimerService *_timerService;
		ICrankCamDecoder *_decoder;
		IIgnitionConfig *_ignitionConfig;
		HardwareAbstraction::Task **_ignitorDwellTask;
		HardwareAbstraction::Task **_ignitorFireTask;
	public:
		IgnitionSchedulingService(
			IgnitionSchedulingServiceConfig *ignitionSchedulingServiceConfig,
			IIgnitionConfig *ignitionConfig,
			IBooleanOutputService **ignitorOutputServices,
			ITimerService *timerService,
			ICrankCamDecoder *decoder);
		void ScheduleEvents(void);

		static void ScheduleEventsCallBack(void *ignitionSchedulingService);
	};
}
#endif