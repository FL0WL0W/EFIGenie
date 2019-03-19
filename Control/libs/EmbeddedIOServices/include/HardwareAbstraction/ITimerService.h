#include "ICallBack.h"
#include "stdint.h"

#ifndef ITIMERSERVICE_H
#define ITIMERSERVICE_H

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
		bool DeleteOnExecution = false;
		//only let TimerService edit these values
		bool Scheduled = false;
		Task *NextTask = 0;
		uint32_t Tick;
	};

	class ITimerService
	{
	private:
		bool _disableCallBack = false;
		bool _callBackCalledWhileDisabled = false;
		uint32_t _maxDelay = 0;
		int _delayStack = 0;
	protected:
		virtual void ScheduleCallBack(const uint32_t tick) = 0;
		uint32_t TimerCallBackAdvance = 0;
	public:
	
		virtual const uint32_t GetTick() = 0;
		virtual const uint32_t GetTicksPerSecond() = 0;

		Task *FirstTask = 0;

		void ReturnCallBack(void);
		Task *ScheduleTask(void(*)(void *), void *, const uint32_t, const bool);
		const bool ScheduleTask(Task *, const uint32_t);
		const bool UnScheduleTask(Task *);
		
		const uint32_t GetElapsedTick(const uint32_t);
		const float GetElapsedTime(const uint32_t);

		constexpr static bool TickLessThanTick(const uint32_t i, const uint32_t j)
		{
			return i - j > 0x10000000;
		}

		constexpr static bool TickLessThanEqualToTick(const uint32_t i, const uint32_t j)
		{
			return i - (j + 1) > 0x10000000;
		}
	};
}
#endif
