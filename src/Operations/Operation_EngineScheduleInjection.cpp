#include "Operations/Operation_EngineScheduleInjection.h"
#include "Config.h"

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;
using namespace EmbeddedIOOperations;

#ifdef OPERATION_ENGINESCHEDULEINJECTION_H
namespace EFIGenie
{
	Operation_EngineScheduleInjection::Operation_EngineScheduleInjection(ITimerService * const timerService, const float tdc, const Operation_EngineScheduleInjection_InjectAt injectAt, const callback_t openCallBack, const callback_t closeCallBack) : 
		_timerService(timerService),
		_tdc(tdc),
		_injectAt(injectAt),
		_openCallBack(openCallBack),
		_closeCallBack(closeCallBack),
		_openTask(new Task([this]() { this->Open(); })),
		_closeTask(new Task([this]() { this->Close(); }))
	{ }

	Operation_EngineScheduleInjection::~Operation_EngineScheduleInjection()
	{
		_timerService->UnScheduleTask(_openTask);
		while(_open) ;
		_timerService->UnScheduleTask(_closeTask);
		delete _openTask;
		delete _closeTask;
	}

	std::tuple<tick_t, tick_t> Operation_EngineScheduleInjection::Execute(EnginePosition enginePosition, bool enable, float injectionPulseWidth, float injectionPosition)
	{
		const tick_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const tick_t pulseTicks = static_cast<tick_t>(injectionPulseWidth * ticksPerSecond);

		if(enginePosition.Synced == false || !enable)
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

		float delta = _tdc - injectionPosition - enginePosition.Position;
		delta -= (static_cast<int16_t>(delta) / cycleDegrees) * cycleDegrees;
		if(delta < 0)
			delta += cycleDegrees;
		tick_t openAt = static_cast<tick_t>(ticksPerDegree * delta) + enginePosition.CalculatedTick - (ticksPerCycle << 1) - ((pulseTicks * _injectAt) / 2);

		//check _lastOpenTick is within range and _openTask is not scheduled
		if( !_openTask->Scheduled && 
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
		tick_t closeAt = 0;
		if(!_open)
		{
			while(ITimerService::TickLessThanTick(openAt - (ticksPerCycle / 2), lastOpenTickBeforeOpenCheck))
				openAt += ticksPerCycle;
			closeAt = openAt + pulseTicks;

			//schedule open event
			_timerService->ScheduleTask(_openTask, openAt);
		}

		// if we are open. schedule close based on when it was opened
		if(_open)
		{
			//schedule close based off the last open tick
			while(ITimerService::TickLessThanTick(openAt + (ticksPerCycle / 2), _lastOpenTick))
				openAt += ticksPerCycle;
			closeAt = _lastOpenTick + pulseTicks;

			//schedule close
			_timerService->ScheduleTask(_closeTask, closeAt);

			//schedule next open event
			openAt += ticksPerCycle;
			_timerService->ScheduleTask(_openTask, openAt);
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

	AbstractOperation *Operation_EngineScheduleInjection::Create(const void *config, size_t &sizeOut, const EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationFactory *factory)
	{
		const float tdc = Config::CastAndOffset<float>(config, sizeOut);
		const Operation_EngineScheduleInjection_InjectAt injectAt = Config::CastAndOffset<Operation_EngineScheduleInjection_InjectAt>(config, sizeOut);
		callback_t openCallBack = 0;
		callback_t closeCallBack = 0;

		size_t size = 0;
		AbstractOperation *operation = factory->Create(config, size);
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
			AbstractOperation *operationClose = factory->Create(config, size);
			Config::OffsetConfig(config, sizeOut, size);
			closeCallBack = [operationClose]() { operationClose->Execute(); };
		}

		return new Operation_EngineScheduleInjection(embeddedIOServiceCollection->TimerService, tdc, injectAt, openCallBack, closeCallBack);
	}
}
#endif