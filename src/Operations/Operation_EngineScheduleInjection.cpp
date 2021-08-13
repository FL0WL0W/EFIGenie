#include "Operations/Operation_EngineScheduleInjection.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINESCHEDULEINJECTION_H
namespace OperationArchitecture
{
	Operation_EngineScheduleInjection::Operation_EngineScheduleInjection(ITimerService *timerService, float tdc, std::function<void()> openCallBack, std::function<void()> closeCallBack) : 
		_timerService(timerService),
		_tdc(tdc),
		_openCallBack(openCallBack),
		_closeCallBack(closeCallBack),
		_openTask(new Task([this]() { this->Open(); })),
		_closeTask(new Task([this]() { this->Close(); }))
		
	{ }

	Operation_EngineScheduleInjection::~Operation_EngineScheduleInjection()
	{
		_timerService->UnScheduleTask(_openTask);
		_timerService->UnScheduleTask(_closeTask);
		_closeCallBack();
		delete _openTask;
		delete _closeTask;
	}

	std::tuple<uint32_t, uint32_t> Operation_EngineScheduleInjection::Execute(EnginePosition enginePosition, bool enable, float injectionPulseWidth, float injectionEndPosition)
	{
		if(enginePosition.Synced == false)
			return std::tuple<uint32_t, uint32_t>(0, 0);

		const uint16_t cycleDegrees = enginePosition.Sequential? 720 : 360;
		const uint32_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const uint32_t ticksPerCycle = static_cast<uint32_t>(cycleDegrees * ticksPerDegree);
		const uint32_t pulseTicks = static_cast<uint32_t>(injectionPulseWidth * ticksPerSecond);

		float delta = _tdc - injectionEndPosition - enginePosition.Position;
		delta -= (static_cast<uint16_t>(delta) / cycleDegrees) * cycleDegrees;
		if(delta < 0)
			delta += cycleDegrees;
		uint32_t closeAt = static_cast<int64_t>(ticksPerDegree * (delta - cycleDegrees)) + enginePosition.CalculatedTick;		
		uint32_t openAt = closeAt - pulseTicks;

		// if we are open. schedule close based on when it was opened
		if(_open)
		{
			while(ITimerService::TickLessThanTick(closeAt - (ticksPerCycle / 2), _lastOpenedAtTick + pulseTicks))
				closeAt += ticksPerCycle;

			//assume plenty of time to schedule next open. if not then injector is saturated.
			openAt = closeAt - pulseTicks;
			//schedule open
			if(enable)
				_timerService->ScheduleTask(_openTask, openAt);

			closeAt = _lastOpenedAtTick + pulseTicks;
			_timerService->ScheduleTask(_closeTask, closeAt);
		}
		//otherwise schedule based on the _openTask->Tick
		else
		{
			//if we aren't open, check _lastOpenedAtTick is not too old
			if(ITimerService::TickLessThanTick(_lastOpenedAtTick + pulseTicks, enginePosition.CalculatedTick - ((ticksPerCycle * 3) / 2)))
			{
				//if it is too old, schedule next pulse by first available cycle
				while(ITimerService::TickLessThanTick(openAt, _timerService->GetTick()))
					openAt += ticksPerCycle;
				closeAt = openAt + pulseTicks;

				//schedule open
				if(enable)
					_timerService->ScheduleTask(_openTask, openAt);

				//schedule close
				_timerService->ScheduleTask(_closeTask, closeAt);
			}
			else
			{
				while(ITimerService::TickLessThanTick(closeAt - (ticksPerCycle / 2), _lastOpenedAtTick + pulseTicks))
					closeAt += ticksPerCycle;
				openAt = closeAt - pulseTicks;

				//schedule open
				if(enable)
				{
					_timerService->ScheduleTask(_openTask, openAt);
					openAt = _openTask->Tick;
				}

				closeAt = openAt + pulseTicks;

				//schedule close
				_timerService->ScheduleTask(_closeTask, closeAt);
			}
		}

		//return the ticks of the open and close. for debugging purposes
		return std::tuple<uint32_t, uint32_t>(openAt, closeAt);
	}

	void Operation_EngineScheduleInjection::Open()
	{
		_openCallBack();
		_lastOpenedAtTick = _openTask->Tick;
		_open = true;
	}

	void Operation_EngineScheduleInjection::Close()
	{
		_closeCallBack();
		_open = false;
	}

	IOperationBase *Operation_EngineScheduleInjection::Create(const void *config, size_t &sizeOut, const EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager)
	{
		const float tdc = Config::CastAndOffset<float>(config, sizeOut);
		std::function<void()> openCallBack = 0;
		std::function<void()> closeCallBack = 0;

		size_t size = 0;
		IOperationBase *operation = packager->Package(config, size);
		Config::OffsetConfig(config, sizeOut, size);
		if(operation->NumberOfParameters == 1)
		{
			openCallBack = [operation]() { operation->Execute(true); };
			closeCallBack = [operation]() { operation->Execute(false); };
		}
		else
		{
			openCallBack = [operation]() { operation->Execute(); };

			size = 0;
			IOperationBase *operation = packager->Package(config, size);
			Config::OffsetConfig(config, sizeOut, size);
			closeCallBack = [operation]() { operation->Execute(); };
		}

		return new Operation_EngineScheduleInjection(embeddedIOServiceCollection->TimerService, tdc, openCallBack, closeCallBack);
	}
}
#endif