#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "EngineControlServices/IgnitionService/IIgnitionConfig.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "HardwareAbstraction/ITimerService.h"
#include "Packed.h"
#include "stdlib.h"
#include "math.h"

using namespace CrankCamDecoders;
using namespace HardwareAbstraction;
using namespace IOServices;

#if !defined(IGNITIONSCHEDULINGSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)  && defined(ICRANKCAMDECODER_H) && (defined(IIGNITIONCONFIG_H)) ||  defined(IINJECTIONCONFIG_H)
#define IGNITIONSCHEDULINGSERVICE_H
namespace EngineControlServices
{
	PACK(
	struct IgnitionSchedulingServiceConfig
	{
	private:
		IgnitionSchedulingServiceConfig()
		{

		}
	public:
		const unsigned int Size() const
		{
			return sizeof(IgnitionSchedulingServiceConfig)
				+ sizeof(unsigned short) * Ignitors;
		}
		const unsigned short *IgnitorTdc() const { return (const unsigned short*)(this + 1); }

		bool SequentialRequired;
		unsigned char Ignitors;
	});

	class IgnitionSchedulingService
	{
	protected:
		const IgnitionSchedulingServiceConfig *_ignitionSchedulingServiceConfig;
		ITimerService *_timerService;
		ICrankCamDecoder *_decoder;
		IIgnitionConfig *_ignitionConfig;
		HardwareAbstraction::Task **_ignitorDwellTask;
		HardwareAbstraction::Task **_ignitorFireTask;
	public:
		IgnitionSchedulingService(
			const IgnitionSchedulingServiceConfig *ignitionSchedulingServiceConfig,
			IIgnitionConfig *ignitionConfig,
			IBooleanOutputService **ignitorOutputServices,
			ITimerService *timerService,
			ICrankCamDecoder *decoder);
		void ScheduleEvents(void);

		static void ScheduleEventsCallBack(void *ignitionSchedulingService);
	};
}
#endif