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
			return (IgnitionSchedulingServiceConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(IgnitionSchedulingServiceConfig);
		}

		unsigned char Cylinders;
		bool IsDistributor;
	});

	class IgnitionSchedulingService
	{
	protected:
		IgnitionSchedulingServiceConfig *_ignitionSchedulingServiceConfig;
		ITimerService *_timerService;
		IDecoder *_decoder;
		IPistonEngineIgnitionConfig *_pistonEngineIgnitionConfig;
		HardwareAbstraction::Task *_ignitorDwellTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_ignitorFireTask[MAX_CYLINDERS];
	public:
		IgnitionSchedulingService(
			IgnitionSchedulingServiceConfig *ignitionSchedulingServiceConfig,
			IPistonEngineIgnitionConfig *pistonEngineIgnitionConfig,
			IBooleanOutputService **ignitorOutputServices,
			ITimerService *timerService,
			IDecoder *decoder);
		void ScheduleEvents(void);
	};
}
#endif