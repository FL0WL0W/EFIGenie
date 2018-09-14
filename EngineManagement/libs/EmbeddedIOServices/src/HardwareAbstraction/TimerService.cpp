#include <algorithm>
#include <stdint.h>
#include "HardwareAbstraction/ITimerService.h"

namespace HardwareAbstraction
{	
	bool GreaterThan(Task *i, Task *j)
	{
		return (i->Tick > j->Tick);
	}
	bool OverFlowGreaterThan(Task *i, Task *j)
	{
		return (i->Tick + 2147483647 > j->Tick + 2147483647);
	}
	
	void CallBackGroup::Execute()
	{
		for (std::list<ICallBack *>::const_iterator iterator = _callBackList.begin(), end = _callBackList.end(); iterator != end; ++iterator)
		{
			(*iterator)->Execute();
		}
	}
	
	void CallBackGroup::Add(void(*callBackPointer)(void *), void *parameters)
	{
		Add(new CallBack(callBackPointer, parameters));
	}
	
	void CallBackGroup::Add(ICallBack *callBack)
	{
		_callBackList.push_back(callBack);
	}
	
	void CallBackGroup::Remove(ICallBack *callBack)
	{
		_callBackList.remove(callBack);
	}
	
	void CallBackGroup::Clear()
	{
		_callBackList.clear();
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
			callTask->Execute();
			if (callTask->DeleteOnExecution)
				delete callTask;
			
			StackSize--;
		}

		if (StackSize == 0)
			return;

		ScheduleCallBack(CallBackStackPointer[StackSize - 1]->Tick);
	}
	
	void ITimerService::SortCallBackStack()
	{
		if(GetTick() <= 2147483648)
			std::sort(CallBackStackPointer, CallBackStackPointer + StackSize, GreaterThan);
		else
			std::sort(CallBackStackPointer, CallBackStackPointer + StackSize, OverFlowGreaterThan);
	}

	Task *ITimerService::ScheduleTask(void(*callBack)(void *), void *parameters, unsigned int tick, bool deleteOnExecution)
	{
		Task *taskToSchedule = new Task(callBack, parameters, deleteOnExecution);

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
			StackSize++;
			SortCallBackStack();
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
	
	unsigned int ITimerService::GetElapsedTick(unsigned int lastTick)
	{
		unsigned int tick = GetTick();
		if (tick < lastTick)
		{
			lastTick += 2147483647;
			tick += 2147483647;
		}
		return tick - lastTick;
	}
	
	float ITimerService::GetElapsedTime(unsigned int lastTick)
	{
		return (GetElapsedTick(lastTick) / (float)GetTicksPerSecond());
	}
}