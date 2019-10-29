#include <algorithm>
#include <stdint.h>
#include "HardwareAbstraction/ITimerService.h"

#ifdef ITIMERSERVICE_H
namespace HardwareAbstraction
{		
	void CallBackGroup::Execute()
	{
		for (std::list<ICallBack *>::const_iterator iterator = _callBackList.begin(), end = _callBackList.end(); iterator != end; ++iterator)
		{
			(*iterator)->Execute();
		}
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
		Task *next = FirstTask;
		while(next != 0 && !next->Scheduled)
			next = next->NextTask;

		while (next != 0 && TickLessThanEqualToTick(next->Tick, GetTick() + TimerCallBackAdvance))
		{
			while(TickLessThanTick(GetTick(), next->Tick)) ;
			
			next->Execute();
			next->Scheduled = false;
			
			next = next->NextTask;
		}

		if(next != 0)
			ScheduleCallBack(next->Tick);
	}

	Task *ITimerService::ScheduleTask(ICallBack *callBack, const uint32_t tick, const bool deleteOnExecution)
	{
		Task *taskToSchedule = new Task(callBack, deleteOnExecution);

		ScheduleTask(taskToSchedule, tick);

		return taskToSchedule;
	}

	const bool ITimerService::ScheduleTask(Task *task, const uint32_t tick)
	{
		while(FirstTask != 0 && !FirstTask->Scheduled)
		{
			Task *del = FirstTask;
			FirstTask = FirstTask->NextTask;

			if(del->DeleteOnExecution)
				delete del;
		}

		//make this not static 1ms
		uint32_t minTick = GetTick() + GetTicksPerSecond() / 1000;
		if(TickLessThanTick(tick, minTick) || (task->Scheduled && TickLessThanTick(task->Tick, minTick)))
			return false;

		if(FirstTask == task)
		{
			FirstTask = FirstTask->NextTask;
			task->Scheduled = false;
		}
		else if(FirstTask != 0)
		{
			Task *iterator = FirstTask;
			while (iterator->NextTask != 0)
			{
				if(iterator->NextTask == task)
				{
					//unschedule task
					iterator->NextTask = iterator->NextTask->NextTask;
					task->Scheduled = false;
					break;
				}
				else
				{
					iterator = iterator->NextTask;
				}
			}
		}

		task->Tick = tick;
		
		if(FirstTask != 0)
		{
			if(TickLessThanTick(tick, FirstTask->Tick))
			{
				//task is FirstTask
				task->NextTask = FirstTask;
				task->Scheduled = true;
				FirstTask = task;
			}
			else
			{
				//insert task
				Task *iterator = FirstTask;
				while (iterator->NextTask != 0 && !task->Scheduled)
				{
					//this is where our task is to be scheduled
					if(TickLessThanTick(tick, iterator->NextTask->Tick))
					{
						task->NextTask = iterator->NextTask;
						task->Scheduled = true;
						iterator->NextTask = task;
					}

					iterator = iterator->NextTask;
				}

				if(!task->Scheduled)
				{
					task->NextTask = 0;
					task->Scheduled = true;
					iterator->NextTask = task;
				}		
			}
		}
		else
		{
			//task is only task
			task->NextTask = 0;
			task->Scheduled = true;
			FirstTask = task;
		}

		ScheduleCallBack(FirstTask->Tick);

		return true;
	}

	const bool ITimerService::UnScheduleTask(Task *task)
	{
		while(FirstTask != 0 && !FirstTask->Scheduled)
		{
			Task *del = FirstTask;
			FirstTask = FirstTask->NextTask;

			if(del->DeleteOnExecution)
				delete del;
		}

		//make this not static 1ms
		uint32_t minTick = GetTick() + GetTicksPerSecond() / 1000;
		if(task->Scheduled && TickLessThanTick(task->Tick, minTick))
			return false;
			
		if(FirstTask == task)
		{
			FirstTask = FirstTask->NextTask;
			task->Scheduled = false;
		}
		else if(FirstTask != 0)
		{
			Task *iterator = FirstTask;
			while (iterator->NextTask != 0)
			{
				if(iterator->NextTask == task)
				{
					//unschedule task
					iterator->NextTask = iterator->NextTask->NextTask;
					task->Scheduled = false;
					break;
				}
				else
				{
					iterator = iterator->NextTask;
				}
			}
		}

		if(FirstTask != 0)
			ScheduleCallBack(FirstTask->Tick);

		return true;
	}
	
	const uint32_t ITimerService::GetElapsedTick(const uint32_t lastTick)
	{
		return GetTick() - lastTick;
	}
	
	const float ITimerService::GetElapsedTime(const uint32_t lastTick)
	{
		return (GetElapsedTick(lastTick) / (float)GetTicksPerSecond());
	}
}
#endif
