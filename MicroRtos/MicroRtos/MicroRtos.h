namespace MicroRtos
{
	class MicroRtos
	{
	protected:
		HardwareAbstraction::ITimerService *_timerService;
	public:
		MicroRtos(HardwareAbstraction::ITimerService *timerService);
		HardwareAbstraction::Task *ScheduleTask(void(*callBack)(void *), void *parameters, unsigned int tick, int Priority, bool deleteOnExecution = true);
		bool ScheduleTask(HardwareAbstraction::Task *task, unsigned int tick);
		bool ReScheduleTask(HardwareAbstraction::Task *task, unsigned int tick);
	};
}