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
		Task *next = 0;
		int i = 0;
		while (FirstTask != 0 && TickLessThanEqualToTick(FirstTask->Tick, GetTick() + TimerCallBackAdvance))
		{
			i++;
			next = FirstTask->NextTask;

			while(TickLessThanTick(GetTick(), FirstTask->Tick)) ;
			
			FirstTask->Execute();
			FirstTask->Scheduled = false;
			if (FirstTask->DeleteOnExecution)
				delete FirstTask;
			
			FirstTask = next;
		}

		if(FirstTask != 0)
			ScheduleCallBack(FirstTask->Tick);
	}

	Task *ITimerService::ScheduleTask(ICallBack *callBack, const uint32_t tick, const bool deleteOnExecution)
	{
		Task *taskToSchedule = new Task(callBack, deleteOnExecution);

		ScheduleTask(taskToSchedule, tick);

		return taskToSchedule;
	}

	const bool ITimerService::ScheduleTask(Task *task, const uint32_t tick)
	{
		//make this not static 1ms
		uint32_t minTick = GetTick() + GetTicksPerSecond() / 1000;
		if(FirstTask != 0 && TickLessThanTick(FirstTask->Tick, minTick))
			return false;

		task->Tick = tick;

		//set to not scheduled
		task->Scheduled = false;

		//remove all FirstTasks where not scheduled
		while(FirstTask != 0 && !FirstTask->Scheduled)
		{
			FirstTask = FirstTask->NextTask;
		}

		if(FirstTask != 0)
		{
			//task is somewhere in the task list
			//remove task
			Task *iterator = FirstTask;
			while (iterator->NextTask != 0)
			{
				if(!iterator->NextTask->Scheduled)
				{
					//unschedule task
					if(TickLessThanTick(iterator->Tick, minTick))
						return false;
					iterator->NextTask = iterator->NextTask->NextTask;
				}
				else
				{
					iterator = iterator->NextTask;
				}
			}

			if(TickLessThanTick(task->Tick, FirstTask->Tick))
			{
				//task is FirstTask
				if(TickLessThanTick(task->Tick, minTick))
					return false;
				task->Scheduled = true;
				task->NextTask = FirstTask;
				FirstTask = task;
			}
			else
			{
				//insert task
				iterator = FirstTask;
				while (iterator->NextTask != 0 && !task->Scheduled)
				{
					//this is where our task is to be scheduled
					if(TickLessThanTick(task->Tick, iterator->NextTask->Tick))
					{
						task->Scheduled = true;
						task->NextTask = iterator->NextTask;
						iterator->NextTask = task;
					}

					iterator = iterator->NextTask;
				}

				if(!task->Scheduled)
				{
					task->Scheduled = true;
					task->NextTask = 0;
					iterator->NextTask = task;
				}		
			}
		}
		else
		{
			//task is only task
			if(TickLessThanTick(task->Tick, minTick))
				return false;
			task->Scheduled = true;
			task->NextTask = 0;
			FirstTask = task;
		}

		ScheduleCallBack(FirstTask->Tick);

		return true;
	}

	const bool ITimerService::UnScheduleTask(Task *task)
	{
		//make this not static 1ms
		uint32_t minTick = GetTick() + GetTicksPerSecond() / 1000;
		if(FirstTask != 0 && TickLessThanTick(FirstTask->Tick, minTick))
			return false;

		//if is next scheduled task
		//set to not scheduled
		task->Scheduled = false;

		//remove all FirstTasks where not scheduled
		while(FirstTask != 0 && !FirstTask->Scheduled)
		{
			FirstTask = FirstTask->NextTask;
		}
		
		if(FirstTask != 0)
		{
			//task is somewhere in the task list
			//remove task
			Task *iterator = FirstTask;
			while (iterator->NextTask != 0)
			{
				if(!iterator->NextTask->Scheduled)
				{
					//unschedule task
					if(TickLessThanTick(iterator->Tick, minTick))
						return false;
					iterator->NextTask = iterator->NextTask->NextTask;
				}
				else
				{
					iterator = iterator->NextTask;
				}
			}

			ScheduleCallBack(FirstTask->Tick);
		}

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
