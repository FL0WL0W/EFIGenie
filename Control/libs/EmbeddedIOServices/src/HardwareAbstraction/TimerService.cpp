#include <algorithm>
#include <stdint.h>
#include "HardwareAbstraction/ITimerService.h"

#ifdef ITIMERSERVICE_H
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
		uint32_t runTick = callTask->Tick;
		while (StackSize > 0 && ((callTask = CallBackStackPointer[StackSize - 1]))->Tick == runTick)
		{
			callTask = CallBackStackPointer[StackSize - 1];
			StackSize--;
			callTask->Execute();
			if (callTask->DeleteOnExecution)
				delete callTask;
			callTask->Scheduled = false;
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

	Task *ITimerService::ScheduleTask(void(*callBack)(void *), void *parameters, uint32_t tick, bool deleteOnExecution)
	{
		Task *taskToSchedule = new Task(callBack, parameters, deleteOnExecution);

		ScheduleTask(taskToSchedule, tick);

		return taskToSchedule;
	}

	bool ITimerService::ScheduleTask(Task *task, uint32_t tick)
	{
		task->Tick = tick;
		CallBackStackPointer[StackSize] = task;
		StackSize++;
		SortCallBackStack();
		if (CallBackStackPointer[StackSize - 1] == task)
		{
			ScheduleCallBack(task->Tick);
		}
		task->Scheduled = true;
		return true;
	}

	bool ITimerService::ReScheduleTask(Task *task, uint32_t tick)
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
		task->Scheduled = true;
		return true;
	}

	bool ITimerService::UnScheduleTask(Task *task)
	{
		Task **end = CallBackStackPointer + StackSize;
		if (CallBackStackPointer[StackSize - 1] == task)
		{
			StackSize = static_cast<uint8_t>(std::remove(CallBackStackPointer, end, task) - CallBackStackPointer);
			ScheduleCallBack(CallBackStackPointer[StackSize - 1]->Tick);
		}
		else
		{
			StackSize = static_cast<uint8_t>(std::remove(CallBackStackPointer, end, task) - CallBackStackPointer);
		}
		task->Scheduled = false;
		return true;
	}
	
	uint32_t ITimerService::GetElapsedTick(uint32_t lastTick)
	{
		uint32_t tick = GetTick();
		if (tick < lastTick)
		{
			lastTick += 2147483647;
			tick += 2147483647;
		}
		return tick - lastTick;
	}
	
	float ITimerService::GetElapsedTime(uint32_t lastTick)
	{
		return (GetElapsedTick(lastTick) / (float)GetTicksPerSecond());
	}
}
#endif
