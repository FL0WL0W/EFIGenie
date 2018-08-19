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

#if !defined(IGNITIONSCHEDULINGSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)  && defined(IDECODER_H) && (defined(IPISTONENGINEIGNITIONCONFIG_H)) ||  defined(IPISTONENGINEINJECTIONCONFIG_H)
#define IGNITIONSCHEDULINGSERVICE_H
namespace EngineManagement
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
		IDecoder *_decoder;
		IPistonEngineIgnitionConfig *_pistonEngineIgnitionConfig;
		HardwareAbstraction::Task **_ignitorDwellTask;
		HardwareAbstraction::Task **_ignitorFireTask;
	public:
		IgnitionSchedulingService(
			IgnitionSchedulingServiceConfig *ignitionSchedulingServiceConfig,
			IPistonEngineIgnitionConfig *pistonEngineIgnitionConfig,
			IBooleanOutputService **ignitorOutputServices,
			ITimerService *timerService,
			IDecoder *decoder);
		void ScheduleEvents(void);

		static void ScheduleEventsCallBack(void *ignitionSchedulingService);
	};
}
#endif