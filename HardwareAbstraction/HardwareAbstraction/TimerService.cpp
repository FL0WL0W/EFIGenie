#include <algorithm>
#include <stdint.h>
#include "ITimerService.h"

namespace HardwareAbstraction
{	
	bool GreaterThan(Task *i, Task *j)
	{
		if (i->Tick == j->Tick)
			return i->Priority > j->Priority;
		else
			return (i->Tick > j->Tick);
	}
	bool OverFlowGreaterThan(Task *i, Task *j)
	{
		if (i->Tick == j->Tick)
			return i->Priority > j->Priority;
		else
			return (i->Tick + 2147483647 > j->Tick + 2147483647);
	}

	void ITimerService::ReturnCallBack(void)
	{
		if (StackSize == 0)
			return;

		HardwareAbstraction::Task *callTask = CallBackStackPointer[StackSize - 1];
		unsigned int runTick = callTask->Tick;
		while (StackSize > 0 && ((callTask = CallBackStackPointer[StackSize - 1]))->Tick == runTick)
		{
			callTask = CallBackStackPointer[StackSize - 1];
			callTask->CallBack(callTask->Parameters);
			if (callTask->DeleteOnExecution)
				delete callTask;
			
			StackSize--;
		}
		
		ScheduleCallBack((*CallBackStackPointer)->Tick);
	}
	
	void ITimerService::SortCallBackStack()
	{
		if(GetTick() <= 2147483648)
			std::sort(CallBackStackPointer, CallBackStackPointer + StackSize, GreaterThan);
		else
			std::sort(CallBackStackPointer, CallBackStackPointer + StackSize, OverFlowGreaterThan);
	}

	Task *ITimerService::ScheduleTask(void(*callBack)(void *), void *parameters, unsigned int tick, int priority, bool deleteOnExecution)
	{
		Task *taskToSchedule = new Task(callBack, parameters, priority, deleteOnExecution);

		ScheduleTask(taskToSchedule, tick);

		return taskToSchedule;
	}

	bool ITimerService::ScheduleTask(Task *task, unsigned int tick)
	{
		task->Tick = tick;
		CallBackStackPointer[StackSize] = task;
		StackSize++;
		SortCallBackStack();
		if (CallBackStackPointer[StackSize - 1] == task)
		{
			ScheduleCallBack(task->Tick);
		}
		return true;
	}

	bool ITimerService::ReScheduleTask(Task *task, unsigned int tick)
	{
		task->Tick = tick;
		Task **end = CallBackStackPointer + StackSize;
		if (std::find(CallBackStackPointer, end, task) == end)
		{
			CallBackStackPointer[StackSize] = task;
			SortCallBackStack();
			StackSize++;
		}
		else
		{
			SortCallBackStack();
		}
		if (CallBackStackPointer[StackSize - 1] == task)
		{
			ScheduleCallBack(task->Tick);
		}
		return true;
	}

	bool ITimerService::UnScheduleTask(Task *task)
	{
		Task **end = CallBackStackPointer + StackSize;
		if (CallBackStackPointer[StackSize - 1] == task)
		{
			ScheduleCallBack(CallBackStackPointer[StackSize - 2]->Tick);
			std::remove(CallBackStackPointer, end, task);
			StackSize--;
		}
		else
		{
			std::remove(CallBackStackPointer, end, task);
			StackSize--;
		}
		return true;
	}
}