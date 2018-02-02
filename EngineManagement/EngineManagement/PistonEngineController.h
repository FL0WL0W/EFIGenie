#define MAX_CYLINDERS 8

namespace EngineManagement
{
	class PistonEngineController
	{
	protected:
		IIgnitorService *_ignitorServices[MAX_CYLINDERS];
		IInjectorService *_injectorServices[MAX_CYLINDERS];
		Decoder::IDecoder *_decoder;
		HardwareAbstraction::ITimerService *_timerService;
		IPistonEngineInjectionConfig *_pistonEngineInjectionConfig;
		IPistonEngineIgnitionConfig *_pistonEngineIgnitionConfig;
		PistonEngineConfig *_pistonEngineConfig;
		HardwareAbstraction::Task *_injectorOpenTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_injectorCloseTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_ignitorDwellTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_ignitorFireTask[MAX_CYLINDERS];
	public:
		PistonEngineController(
			HardwareAbstraction::ITimerService *timerService, 
			Decoder::IDecoder *decoder, 
			IIgnitorService *ignitorServices[MAX_CYLINDERS], 
			IInjectorService *injectorServices[MAX_CYLINDERS], 
			IPistonEngineInjectionConfig *pistonEngineInjectionConfig, 
			IPistonEngineIgnitionConfig *pistonEngineIgnitionConfig, 
			PistonEngineConfig *pistonEngineConfig);
		void ScheduleEvents(void);
	};
}