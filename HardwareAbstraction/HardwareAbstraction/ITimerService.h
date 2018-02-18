#define TIMERSERVICE_MAX_STACK_SIZE 256

namespace HardwareAbstraction
{
	struct Task
	{
	public:
		Task() {}
		Task(void(*callBack)(void *), void *parameters, char priority, bool deleteOnExecution)
		{
			CallBack = callBack;
			Parameters = parameters;
			Priority = priority;
			DeleteOnExecution = deleteOnExecution;
		}

		void(*CallBack)(void *);
		void *Parameters;
		bool DeleteOnExecution;
		//only let TimerService edit these values
		char Priority;
		unsigned int Tick;
	};

	class ITimerService
	{
	protected:
		void SortCallBackStack();
		virtual void ScheduleCallBack(unsigned int tick) = 0;
	public:
#if TIMERSERVICE_MAX_STACK_SIZE <= 2^8
		unsigned char StackSize = 0;
#elif TIMERSERVICE_MAX_STACK_SIZE <= 2^16
		unsigned short StackSize = 0;
#elif TIMERSERVICE_MAX_STACK_SIZE <= 2^32
		unsigned int StackSize = 0;
#endif
		Task *CallBackStackPointer[TIMERSERVICE_MAX_STACK_SIZE];

		virtual unsigned int GetTick(void) = 0;
		virtual unsigned int GetTicksPerSecond() = 0;

		void ReturnCallBack(void);
		Task *ScheduleTask(void(*callBack)(void *), void *parameters, unsigned int tick, int priority, bool deleteOnExecution);
		bool ScheduleTask(Task *task, unsigned int tick);
		bool ReScheduleTask(Task *task, unsigned int tick);
		bool UnScheduleTask(Task *task);
	};
}