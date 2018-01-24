#include <stdint.h>
#include <map>
#include <functional>
#include <algorithm>
#include "ITimerService.h"
#include "MicroRtos.h"

namespace MicroRtos
{
	std::multimap<unsigned int, Task*>::iterator MicroRtos::FirstTask(void)
	{
		std::multimap<unsigned int, Task*>::iterator begin = _taskMap.begin();
		std::multimap<unsigned int, Task*>::iterator end = --_taskMap.end();
		if (begin->first >= 1431655765 || end->first < 2863311531)
		{
			return begin;
		}
		else
		{
			return std::find_if(begin,
				end,
				[](const std::pair<unsigned int, Task*> & x)-> bool
				{ return x.first >= 2147483648; });
		}
	}
	
	
	MicroRtos::MicroRtos(HardwareAbstraction::ITimerService *service)
	{
		_service = service;
		service->SetCallBack(std::bind(&MicroRtos::TaskHandler, this));
	}

	void MicroRtos::TaskHandler()
	{
		if (_taskMap.empty())
			return;
		
		unsigned int currentTick = _service->GetTick();;
		
		//add task to exicuting queue
		std::multimap<unsigned int, Task*>::iterator task;
		while ((currentTick < 2863311531 && (task = _taskMap.begin())->first < currentTick) || (currentTick >= 2863311531 && (task = FirstTask())->first >= 1431655765))
		{
			_executingTasks.insert(std::pair<int, Task*>(task->second->Priority, task->second));
			_taskMap.erase(task);
		}

		//execute queue
		std::multimap<int, Task*>::iterator executingTask = _executingTasks.begin();
		while (!_executingTasks.empty() && executingTask->second->Status == TaskStatus::Pending)
		{
			//schedule timer before executing
			if (!_taskMap.empty())
				_service->ScheduleCallBack(FirstTask()->first);
			
			executingTask->second->Status = TaskStatus::Running;

			executingTask->second->CallTask();

			executingTask->second->Status = TaskStatus::Off;

			if (executingTask->second->DeleteOnExecution)
				delete executingTask->second;

			_executingTasks.erase(executingTask);

			executingTask = _executingTasks.begin();
		}
	}

	Task *MicroRtos::ScheduleTask(std::function<void()> callBack, unsigned int tick, int priority, bool deleteOnExecution)
	{
		Task *taskToSchedule = new Task(callBack, priority, deleteOnExecution);
		_taskMap.insert(std::pair<unsigned int, Task*>(tick, taskToSchedule));
				
		taskToSchedule->Status = TaskStatus::Pending;
		taskToSchedule->Tick = tick;
		
		std::multimap<unsigned int, Task*>::iterator firstTask = FirstTask();
	
		if (firstTask->first == tick)
		{
			_service->ScheduleCallBack(tick);
		}
		
		return taskToSchedule;
	}
	
	bool MicroRtos::ScheduleTask(Task *task, unsigned int tick)
	{
		if (task->Status != TaskStatus::Off)
			return false;
		
		task->Status = TaskStatus::Pending;
		task->Tick = tick;
		
		_taskMap.insert(std::pair<long unsigned int, Task*>(tick, task));
		
		std::multimap<unsigned int, Task*>::iterator firstTask = FirstTask();
	
		if (firstTask->first == tick)
		{
			_service->ScheduleCallBack(tick);
		}
		
		return true;
	}
	
	bool MicroRtos::ReScheduleTask(Task *task, unsigned int tick)
	{
		if (task->Status == TaskStatus::Running)
			return false;
		
		task->Status = TaskStatus::Pending;
		task->Tick = tick;
		
		for (std::multimap<unsigned int, Task*>::iterator it = _taskMap.begin(); it != _taskMap.end(); ++it)
			if (it->second == task)
				_taskMap.erase(it);
		
		_taskMap.insert(std::pair<long unsigned int, Task*>(tick, task));
		
		std::multimap<unsigned int, Task*>::iterator firstTask = FirstTask();
	
		if (firstTask->first == tick)
		{
			_service->ScheduleCallBack(tick);
		}
		
		return true;
	}
	
	unsigned int MicroRtos::GetTick()
	{
		return _service->GetTick();
	}
	
	unsigned int MicroRtos::GetTicksPerSecond()
	{
		return _service->GetTicksPerSecond();
	}
}