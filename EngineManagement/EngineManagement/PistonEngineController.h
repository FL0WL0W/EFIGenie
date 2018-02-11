namespace EngineManagement
{
	class PistonEngineController
	{
	protected:
#ifndef NOINJECTION
		IPistonEngineInjectionConfig *_pistonEngineInjectionConfig;
#endif
		IPistonEngineIgnitionConfig *_pistonEngineIgnitionConfig;
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
			IPistonEngineIgnitionConfig *pistonEngineIgnitionConfig, 
			PistonEngineConfig *pistonEngineConfig);
		void ScheduleEvents(void);
	};
}