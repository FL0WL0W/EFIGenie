#include "ICallBack.h"

#ifndef ITIMERSERVICE_H
#define ITIMERSERVICE_H

#define TIMERSERVICE_MAX_STACK_SIZE 256

namespace HardwareAbstraction
{
	class Task
	{
	public:
		Task() {}
		Task(void(*callBack)(void *), void *parameters, bool deleteOnExecution)
		{
			CallBackInstance = new CallBack(callBack, parameters);
			DeleteOnExecution = deleteOnExecution;
		}
		Task(ICallBack *callBack, bool deleteOnExecution)
		{
			CallBackInstance = callBack;
			DeleteOnExecution = deleteOnExecution;
		}

		void Execute()
		{
			CallBackInstance->Execute();
		}

		ICallBack *CallBackInstance;
		bool DeleteOnExecution;
		//only let TimerService edit these values
		uint32_t Tick;
	};

	class ITimerService
	{
	protected:
		void SortCallBackStack();
		virtual void ScheduleCallBack(uint32_t tick) = 0;
	public:
#if TIMERSERVICE_MAX_STACK_SIZE <= 2^8
		uint8_t StackSize = 0;
#elif TIMERSERVICE_MAX_STACK_SIZE <= 2^16
		uint16_t StackSize = 0;
#elif TIMERSERVICE_MAX_STACK_SIZE <= 2^32
		uint32_t StackSize = 0;
#endif
		Task *CallBackStackPointer[TIMERSERVICE_MAX_STACK_SIZE];

		virtual uint32_t GetTick(void) = 0;
		virtual uint32_t GetTicksPerSecond() = 0;

		void ReturnCallBack(void);
		Task *ScheduleTask(void(*)(void *), void *, uint32_t, bool);
		bool ScheduleTask(Task *, uint32_t);
		bool ReScheduleTask(Task *, uint32_t);
		bool UnScheduleTask(Task *);
		
		uint32_t GetElapsedTick(uint32_t);
		float GetElapsedTime(uint32_t);
	};
}
#endif
