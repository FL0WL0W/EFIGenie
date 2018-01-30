#define MAX_CYLINDERS 8

namespace EngineManagement
{
	class PistonEngineController
	{
	protected:
		IIgnitionService *_ignitionServices[MAX_CYLINDERS];
		IInjectorService *_injectorServices[MAX_CYLINDERS];
		Decoder::IDecoder *_decoder;
		HardwareAbstraction::ITimerService *_timerService;
		IPistonEngineConfig *_pistonEngineConfig;
		HardwareAbstraction::Task *_injectorOpenTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_injectorCloseTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_ignitionDwellTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_ignitionFireTask[MAX_CYLINDERS];
	public:
		PistonEngineController(HardwareAbstraction::ITimerService *timerService, Decoder::IDecoder *decoder, IIgnitionService *ignitionServices[MAX_CYLINDERS], IInjectorService *injectorServices[MAX_CYLINDERS], IPistonEngineConfig *pistonEngineConfig);
		void ScheduleEvents(void);
	};
}