#if (defined(IIgnitorServiceExists) && defined(IPistonEngineIgnitionConfigExists)) || (defined(IInjectorServiceExists) && defined(IPistonEngineInjectionConfigExists))
#define PistonEngineControllerExists
namespace EngineManagement
{
	class PistonEngineController
	{
	protected:
#if defined(IInjectorServiceExists)
		HardwareAbstraction::Task *_injectorOpenTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_injectorCloseTask[MAX_CYLINDERS];
#endif
#if defined(IIgnitorServiceExists)
		HardwareAbstraction::Task *_ignitorDwellTask[MAX_CYLINDERS];
		HardwareAbstraction::Task *_ignitorFireTask[MAX_CYLINDERS];
#endif
	public:
		PistonEngineController();
		void ScheduleEvents(void);
	};

	extern PistonEngineController *CurrentPistonEngineController;
}
#endif