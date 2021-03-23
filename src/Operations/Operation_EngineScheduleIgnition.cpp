#include "Operations/Operation_EngineScheduleIgnition.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINESCHEDULEIGNITION_H
namespace OperationArchitecture
{
	Operation_EngineScheduleIgnition::Operation_EngineScheduleIgnition(ITimerService *timerService, float tdc, IOperation<void, bool> *ignitionOutputOperation)
	{
		_timerService = timerService;
		_tdc = tdc;
		_predictor = Operation_EnginePositionPrediction::Construct();
		_ignitionOutputOperation = ignitionOutputOperation;
		_dwellTask = new Task(new CallBack<Operation_EngineScheduleIgnition>(this, &Operation_EngineScheduleIgnition::Dwell), false);
		_igniteTask = new Task(new CallBack<Operation_EngineScheduleIgnition>(this, &Operation_EngineScheduleIgnition::Ignite), false);
	}

	std::tuple<uint32_t, uint32_t> Operation_EngineScheduleIgnition::Execute(EnginePosition enginePosition, float ignitionDwell, float ignitionAdvance)
	{
		if(enginePosition.Synced == false)
			return std::tuple<uint32_t, uint32_t>(0, 0);

		const uint32_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const uint32_t ticksPerCycle = static_cast<uint32_t>((enginePosition.Sequential? 720 : 360) * ticksPerDegree);

		//we want to set the next dwell tick
		uint32_t dwellTicks = static_cast<uint32_t>(ignitionDwell * ticksPerSecond);
		uint32_t dwellTick = _predictor->Execute(ignitionAdvance, enginePosition);
		dwellTick = dwellTick - dwellTicks;
		while(ITimerService::TickLessThanTick(dwellTick, enginePosition.CalculatedTick))
			dwellTick = dwellTick + ticksPerCycle;

		_timerService->ScheduleTask(_dwellTask, dwellTick);

		//we only want to change the timing when we are not dwelling. otherwise our dwell could be too short or too long.
		if(_dwellingAtTick == 0)
			_ignitionAt = _tdc - ignitionAdvance;

		//but we do want to adjust the ignition tick so that it is spot on
		uint32_t ignitionTick = _predictor->Execute(_ignitionAt, enginePosition);
		//if the prediction is for a previous position. add for next position
		while((_dwellingAtTick == 0 && ITimerService::TickLessThanTick(ignitionTick, enginePosition.CalculatedTick)) || (_dwellingAtTick != 0 && ITimerService::TickLessThanTick(ignitionTick, _dwellingAtTick)))
			ignitionTick = ignitionTick + ticksPerCycle;

		_timerService->ScheduleTask(_igniteTask, ignitionTick);

		//return the ticks of the dwell and ignition. for debugging purposes
		return std::tuple<uint32_t, uint32_t>(dwellTick == 0? 1 : dwellTick, ignitionTick == 0? 1 : ignitionTick);
	}

	void Operation_EngineScheduleIgnition::Dwell()
	{
		_ignitionOutputOperation->Execute(true);
		_dwellingAtTick = _timerService->GetTick();
		if(_dwellingAtTick == 0)
			_dwellingAtTick = 1;
	}

	void Operation_EngineScheduleIgnition::Ignite()
	{
		_ignitionOutputOperation->Execute(false);
		_dwellingAtTick = 0;
	}

	static IOperationBase *Create(const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
	{
		const float tdc = Config::CastAndOffset<float>(config, sizeOut);
		IOperation<void, bool> * const ignitionOutputOperation = 0;// = serviceLocator->LocateAndCast<IOperation<void, bool>>(BUILDER_OPERATION, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));

		return new Operation_EngineScheduleIgnition(embeddedIOServiceCollection->TimerService, tdc, ignitionOutputOperation);
	}
}
#endif