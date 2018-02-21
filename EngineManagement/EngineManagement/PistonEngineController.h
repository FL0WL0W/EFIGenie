namespace EngineManagement
{
	class PistonEngineController
	{
	protected:
#ifndef NOINJECTION
		IPistonEngineInjectionConfig *_pistonEngineInjectionConfig;
#endif
#ifndef NOIGNITION
		IPistonEngineIgnitionConfig *_pistonEngineIgnitionConfig;
#endif
		PistonEngineConfig *_pistonEngineConfig;
		HardwareAbstraction::Task *_injectorOpenTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_injectorCloseTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_ignitorDwellTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_ignitorFireTask[MAX_CYLINDERS];
	public:
		PistonEngineController(
#ifndef NOINJECTION
			IPistonEngineInjectionConfig *pistonEngineInjectionConfig, 
#endif
#ifndef NOIGNITION
			IPistonEngineIgnitionConfig *pistonEngineIgnitionConfig, 
#endif
			PistonEngineConfig *pistonEngineConfig);
		void ScheduleEvents(void);
	};
}