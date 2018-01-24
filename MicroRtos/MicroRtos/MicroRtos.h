namespace MicroRtos
{
	enum TaskStatus
	{
		Off     = 0,
		Pending = 1,
		Running	= 2
	};
	
	class Task
	{
	public:
		Task(std::function<void()> callBack, int priority, bool deleteOnExecution)
		{
			CallTask = callBack;
			Priority = priority;
			DeleteOnExecution = deleteOnExecution;
		}
	
		std::function<void()> CallTask;
		int Priority;
		bool DeleteOnExecution;
		//only let MicroRtos edit these values
		TaskStatus Status;
		unsigned int Tick;
	};
	
	class MicroRtos
	{
	protected:
		HardwareAbstraction::ITimerService *_service;
		std::multimap<unsigned int, Task*> _taskMap;
		std::multimap<int, Task*> _executingTasks;
		std::multimap<unsigned int, Task*>::iterator FirstTask(void);
		void TaskHandler(unsigned int currentTick);
	public:
		MicroRtos(HardwareAbstraction::ITimerService *service);
		Task *ScheduleTask(std::function<void()> callBack, unsigned int tick, int Priority, bool deleteOnExecution = true);
		bool ScheduleTask(Task *task, unsigned int tick);
		bool ReScheduleTask(Task *task, unsigned int tick);
		unsigned int GetTick();
		unsigned int GetTicksPerSecond();
	};
}