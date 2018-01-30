#include <stdint.h>
#include <map>
#include <functional>
#include <algorithm>
#include "ITimerService.h"

namespace HardwareAbstraction
{	
	bool LessThan(Task *i, Task *j)
	{
		if (i->Tick == j->Tick)
			return i->Priority < j->Priority;
		else
			return (i->Tick + 2147483647 < j->Tick + 2147483647);
	}
	bool OverFlowLessThan(Task *i, Task *j)
	{
		if (i->Tick == j->Tick)
			return i->Priority < j->Priority;
		else
			return (i->Tick + 2147483647 < j->Tick + 2147483647);
	}

	void ITimerService::SortCallBackStack()
	{
		if(GetTick() <= 2147483648)
			std::sort(CallBackStackPointer, CallBackStackPointer + StackSize, LessThan);
		else
			std::sort(CallBackStackPointer, CallBackStackPointer + StackSize, OverFlowLessThan);
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
}