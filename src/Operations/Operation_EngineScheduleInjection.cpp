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

	std::tuple<tick_t, tick_t> Operation_EngineScheduleInjection::Execute(EnginePosition enginePosition, bool enable, float injectionPulseWidth, float injectionEndPosition)
	{
		const tick_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const tick_t pulseTicks = static_cast<tick_t>(injectionPulseWidth * ticksPerSecond);

		if(enginePosition.Synced == false)
		{
			_timerService->UnScheduleTask(_openTask);
			//if we are open and have no matching close event, schedule one
			if(!_closeTask->Scheduled && _open)
			{
				const tick_t closeAt = _lastOpenTick + pulseTicks;
				_timerService->ScheduleTask(_closeTask, closeAt);
				_lastOpenTick = 0;

				return std::tuple<tick_t, tick_t>(0, closeAt);
			}

			return std::tuple<tick_t, tick_t>(0, 0);
		}

		const uint16_t cycleDegrees = enginePosition.Sequential? 720 : 360;
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const tick_t ticksPerCycle = static_cast<tick_t>(cycleDegrees * ticksPerDegree);

		float delta = _tdc - injectionEndPosition - enginePosition.Position;
		delta -= (static_cast<int16_t>(delta) / cycleDegrees) * cycleDegrees;
		if(delta < 0)
			delta += cycleDegrees;
		tick_t closeAt = static_cast<tick_t>(ticksPerDegree * delta) + enginePosition.CalculatedTick - (ticksPerCycle << 1);			
		tick_t openAt = closeAt - pulseTicks;

		//check _lastOpenTick is within range if enabled and _openTask is not scheduled
		if( enable && !_openTask->Scheduled && 
			(_lastOpenTick == 0 ||
			ITimerService::TickLessThanTick(_lastOpenTick + pulseTicks, enginePosition.CalculatedTick - ((ticksPerCycle * 3) / 2)) ||
			ITimerService::TickLessThanTick(enginePosition.CalculatedTick + ((ticksPerCycle * 3) / 2), _lastOpenTick)))
		{
			//if it is not within range, set it to what would be the previous open
			_lastOpenTick = openAt;
			while(ITimerService::TickLessThanTick(_lastOpenTick, _timerService->GetTick() - ticksPerCycle))
				_lastOpenTick += ticksPerCycle;
		}
		
		// if we aren't open, schedule the open event
		const uint32_t lastOpenTickBeforeOpenCheck = _lastOpenTick;
		if(!_open)
		{
			while(ITimerService::TickLessThanTick(openAt - (ticksPerCycle / 2), lastOpenTickBeforeOpenCheck))
				openAt += ticksPerCycle;
			closeAt = openAt + pulseTicks;

			//schedule open event
			if(enable)
				_timerService->ScheduleTask(_openTask, openAt);
			else
				_timerService->UnScheduleTask(_openTask);
		}

		// if we are open. schedule close based on when it was opened
		if(_open)
		{
			//schedule close based off the last open tick
			while(ITimerService::TickLessThanTick(openAt + (ticksPerCycle / 2), _lastOpenTick))
				openAt += ticksPerCycle;
			closeAt = openAt + pulseTicks;

			//schedule close
			_timerService->ScheduleTask(_closeTask, closeAt);

			//schedule next open event
			openAt += ticksPerCycle;
			if(enable)
				_timerService->ScheduleTask(_openTask, openAt);
			else
				_timerService->UnScheduleTask(_openTask);
		}
		//if we are not open, just use the previously calculated close tick.
		else
		{
			_timerService->ScheduleTask(_closeTask, closeAt);
		}

		//return the ticks of the open and close. for debugging purposes
		return std::tuple<tick_t, tick_t>(openAt, closeAt);
	}

	void Operation_EngineScheduleInjection::Open()
	{
		_openCallBack();
		if(!_open)
			_lastOpenTick = _openTask->ExecutedTick == 0? 1 : _openTask->ExecutedTick;
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