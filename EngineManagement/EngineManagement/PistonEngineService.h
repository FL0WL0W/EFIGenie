#include "IBooleanOutputService.h"
#include "PistonEngineConfig.h"
#include "IPistonEngineIgnitionConfig.h"
#include "IPistonEngineInjectionConfig.h"
#include "IDecoder.h"
#include "ITimerService.h"
#include "IBooleanOutputService.h"

using namespace Decoder;
using namespace HardwareAbstraction;
using namespace IOService;

#if !defined(PISTONENGINECONTROLLER_H) && defined(IBOOLEANOUTPUTSERVICE_H)  && defined(IDECODER_H) && (defined(IPISTONENGINEIGNITIONCONFIG_H)) ||  defined(IPISTONENGINEINJECTIONCONFIG_H)
#define PISTONENGINECONTROLLER_H
namespace EngineManagement
{
	class PistonEngineService
	{
	protected:
		PistonEngineConfig *_pistonEngineConfig;
		ITimerService *_timerService;
		IDecoder *_decoder;
		IPistonEngineInjectionConfig *_pistonEngineInjectionConfig;
		HardwareAbstraction::Task *_injectorOpenTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_injectorCloseTask[MAX_CYLINDERS];
		IPistonEngineIgnitionConfig *_pistonEngineIgnitionConfig;
		HardwareAbstraction::Task *_ignitorDwellTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_ignitorFireTask[MAX_CYLINDERS];
	public:
		PistonEngineService(
			PistonEngineConfig *pistonEngineConfig,
			IPistonEngineInjectionConfig *pistonEngineInjectionConfig,
			IBooleanOutputService **injectorOutputServices,
			IPistonEngineIgnitionConfig *pistonEngineIgnitionConfig,
			IBooleanOutputService **ignitorOutputServices,
			ITimerService *timerService,
			IDecoder *decoder);
		void ScheduleEvents(void);
	};
}
#endif