#include "Operations/Operation_EngineScheduleInjection.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINESCHEDULEINJECTION_H
namespace OperationArchitecture
{
	Operation_EngineScheduleInjection::Operation_EngineScheduleInjection(ITimerService *timerService, Operation_EnginePositionPrediction *predictor, float tdc, std::function<void()> openCallBack, std::function<void()> closeCallBack)
	{
		_timerService = timerService;
		_tdc = tdc;
		_predictor = predictor;
		_openCallBack = openCallBack;
		_closeCallBack = closeCallBack;
		_openTask = new Task([this]() { this->Open(); });
		_closeTask = new Task([this]() { this->Close(); });
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
		_openCallBack();
		_lastOpenedAtTick = _openTask->Tick;
		if(_lastOpenedAtTick == 0)
			_lastOpenedAtTick = 1;
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

		return new Operation_EngineScheduleInjection(embeddedIOServiceCollection->TimerService, new Operation_EnginePositionPrediction(embeddedIOServiceCollection->TimerService), tdc, openCallBack, closeCallBack);
	}
}
#endif