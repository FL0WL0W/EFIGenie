#include "Operations/Operation_EngineScheduleInjection.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINESCHEDULEINJECTION_H
namespace OperationArchitecture
{
	Operation_EngineScheduleInjection::Operation_EngineScheduleInjection(ITimerService *timerService, Operation_EnginePositionPrediction *predictor, float tdc, ICallBack *openCallBack, ICallBack *closeCallBack)
	{
		_timerService = timerService;
		_tdc = tdc;
		_predictor = predictor;
		_openCallBack = openCallBack;
		_closeCallBack = closeCallBack;
		_openTask = new Task(new CallBack<Operation_EngineScheduleInjection>(this, &Operation_EngineScheduleInjection::Open), false);
		_closeTask = new Task(new CallBack<Operation_EngineScheduleInjection>(this, &Operation_EngineScheduleInjection::Close), false);
	}

	std::tuple<float, float> Operation_EngineScheduleInjection::Execute(EnginePosition enginePosition, float injectionPulseWidth, float injectionEndPosition)
	{
		if(enginePosition.Synced == false)
			return std::tuple<float, float>(0, 0);

		const uint32_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const uint32_t ticksPerCycle = static_cast<uint32_t>((enginePosition.Sequential? 720 : 360) * ticksPerDegree);

		uint32_t pulseTicks = static_cast<uint32_t>((injectionPulseWidth * (enginePosition.Sequential? 1 : 0.5f)) * ticksPerSecond);//this is not going to work. need to do something different for non sequential
		uint32_t injectEndAt = _predictor->Execute(_tdc + injectionEndPosition, enginePosition);;
		//we always want to schedule the opening time.
		uint32_t injectAt = injectEndAt - pulseTicks;
		while(ITimerService::TickLessThanTick(injectAt, enginePosition.CalculatedTick))
			injectAt = injectAt + ticksPerCycle;

		_timerService->ScheduleTask(_openTask, injectAt);

		while(ITimerService::TickLessThanTick(injectEndAt, enginePosition.CalculatedTick))
			injectEndAt = injectEndAt + ticksPerCycle;

		//if we haven't opened since last revolution and the new schedule is next revolution. we need to open now
		if(_lastOpenedAtTick != 0 && injectAt - _lastOpenedAtTick > (ticksPerCycle / 2) * 3 && !_open)
		{
			Open();
			_timerService->ScheduleTask(_closeTask, _lastOpenedAtTick + pulseTicks);
		}
		//if we are not already open we want to reschedule the closing time
		else if(!_open)
		{
			_timerService->ScheduleTask(_closeTask, injectEndAt);
		}

		//return the ticks of the open and close. for debugging purposes
		return std::tuple<float, float>(injectAt == 0? 1 : injectAt, injectEndAt == 0? 1 : injectEndAt);
	}

	void Operation_EngineScheduleInjection::Open()
	{
		_openCallBack->Execute();
		_lastOpenedAtTick = _timerService->GetTick();
		if(_lastOpenedAtTick == 0)
			_lastOpenedAtTick = 1;
		_open = true;
	}

	void Operation_EngineScheduleInjection::Close()
	{
		_closeCallBack->Execute();
		_open = false;
	}

	static IOperationBase *Create(const EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
	{
		const float tdc = Config::CastAndOffset<float>(config, sizeOut);
		//serviceLocator->LocateAndCast<IOperation<void, bool>>(BUILDER_OPERATION, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));
		ICallBack * const openCallBack = 0;
		ICallBack * const closeCallBack = 0;

		return new Operation_EngineScheduleInjection(embeddedIOServiceCollection->TimerService, new Operation_EnginePositionPrediction(embeddedIOServiceCollection->TimerService), tdc, openCallBack, closeCallBack);
	}
}
#endif