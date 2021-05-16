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

		const uint32_t pulseTicks = static_cast<uint32_t>(injectionPulseWidth * ticksPerSecond);
		//we always want to schedule the opening time.
		uint32_t injectAt = _predictor->Execute(_tdc + injectionEndPosition, enginePosition) - pulseTicks;
		while(ITimerService::TickLessThanTick(injectAt, enginePosition.CalculatedTick))
			injectAt = injectAt + ticksPerCycle;

		//if we have already opened this cycle, schedule for next cycle
		if(_lastOpenedAtTick != 0 && ITimerService::TickLessThanTick(injectAt - _lastOpenedAtTick, ticksPerCycle / 2))
			injectAt = injectAt + ticksPerCycle;

		_timerService->ScheduleTask(_openTask, injectAt);

		// if we are open. schedule close based on when it was opened
		if(_open)
		{
			_timerService->ScheduleTask(_closeTask, _lastOpenedAtTick + pulseTicks);
		}
		//otherwise schedule based on the _openTask->Tick
		else
		{
			_timerService->ScheduleTask(_closeTask, _openTask->Tick + pulseTicks);
		}

		//return the ticks of the open and close. for debugging purposes
		return std::tuple<float, float>(_openTask->Tick, _closeTask->Tick);
	}

	void Operation_EngineScheduleInjection::Open()
	{
		_openCallBack->Execute();
		_lastOpenedAtTick = _openTask->Tick;
		if(_lastOpenedAtTick == 0)
			_lastOpenedAtTick = 1;
		_open = true;
	}

	void Operation_EngineScheduleInjection::Close()
	{
		_closeCallBack->Execute();
		_open = false;
	}

	IOperationBase *Operation_EngineScheduleInjection::Create(const void *config, unsigned int &sizeOut, const EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager)
	{
		const float tdc = Config::CastAndOffset<float>(config, sizeOut);
		ICallBack * openCallBack = 0;
		ICallBack * closeCallBack = 0;

		unsigned int size = 0;
		IOperationBase *operation = packager->Package(config, size);
		Config::OffsetConfig(config, sizeOut, size);
		if(operation->NumberOfParameters == 1)
		{
			openCallBack = new CallBackWithParameters<IOperationBase, bool>(operation, &IOperationBase::Execute<bool>, 1);
			closeCallBack = new CallBackWithParameters<IOperationBase, bool>(operation, &IOperationBase::Execute<bool>, false);
		}
		else
		{
			openCallBack = new CallBack<IOperationBase>(operation, &IOperationBase::Execute);

			size = 0;
			IOperationBase *operation = packager->Package(config, size);
			Config::OffsetConfig(config, sizeOut, size);
			closeCallBack = new CallBack<IOperationBase>(operation, &IOperationBase::Execute);
		}

		return new Operation_EngineScheduleInjection(embeddedIOServiceCollection->TimerService, new Operation_EnginePositionPrediction(embeddedIOServiceCollection->TimerService), tdc, openCallBack, closeCallBack);
	}
}
#endif