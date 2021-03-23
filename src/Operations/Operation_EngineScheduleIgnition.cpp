#include "Operations/Operation_EngineScheduleIgnition.h"

#ifdef OPERATION_ENGINESCHEDULEIGNITION_H
namespace OperationArchitecture
{
	Operation_EngineScheduleIgnition::Operation_EngineScheduleIgnition(EmbeddedIOServices::ITimerService *timerService, float tdc, IOperation<void, ScalarVariable> *ignitionOutputOperation)
	{
		_timerService = timerService;
		_tdc = tdc;
		_predictor = Operation_EnginePositionPrediction::Construct(timerService);
		_ignitionOutputOperation = ignitionOutputOperation;
		_dwellTask = new HardwareAbstraction::Task(new CallBack<Operation_EngineScheduleIgnition>(this, &Operation_EngineScheduleIgnition::Dwell), false);
		_igniteTask = new HardwareAbstraction::Task(new CallBack<Operation_EngineScheduleIgnition>(this, &Operation_EngineScheduleIgnition::Ignite), false);
	}

	std::tuple<ScalarVariable, ScalarVariable> Operation_EngineScheduleIgnition::Execute(EnginePosition enginePosition, ScalarVariable ignitionDwell, ScalarVariable ignitionAdvance)
	{
		if(enginePosition.Synced == false)
			return std::tuple<ScalarVariable, ScalarVariable>(ScalarVariable(false), ScalarVariable(false));

		const uint32_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const uint32_t ticksPerCycle = static_cast<uint32_t>((enginePosition.Sequential? 720 : 360) * ticksPerDegree);

		//we want to set the next dwell tick
		uint32_t dwellTicks = static_cast<uint32_t>(ignitionDwell.To<float>() * ticksPerSecond);
		uint32_t dwellTick = _predictor->Execute(ignitionAdvance, enginePosition).To<uint32_t>();
		dwellTick = dwellTick - dwellTicks;
		while(HardwareAbstraction::ITimerService::TickLessThanTick(dwellTick, enginePosition.CalculatedTick))
			dwellTick = dwellTick + ticksPerCycle;

		_timerService->ScheduleTask(_dwellTask, dwellTick);

		//we only want to change the timing when we are not dwelling. otherwise our dwell could be too short or too long.
		if(_dwellingAtTick == 0)
			_ignitionAt = ScalarVariable(_tdc) - ignitionAdvance;

		//but we do want to adjust the ignition tick so that it is spot on
		uint32_t ignitionTick = _predictor->Execute(_ignitionAt, enginePosition).To<uint32_t>();
		//if the prediction is for a previous position. add for next position
		while((_dwellingAtTick == 0 && HardwareAbstraction::ITimerService::TickLessThanTick(ignitionTick, enginePosition.CalculatedTick)) || (_dwellingAtTick != 0 && HardwareAbstraction::ITimerService::TickLessThanTick(ignitionTick, _dwellingAtTick)))
			ignitionTick = ignitionTick + ticksPerCycle;

		_timerService->ScheduleTask(_igniteTask, ignitionTick);

		//return the ticks of the dwell and ignition. for debugging purposes
		return std::tuple<ScalarVariable, ScalarVariable>(ScalarVariable::FromTick(dwellTick), ScalarVariable::FromTick(ignitionTick));
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

	IOperationBase *Operation_EngineScheduleIgnition::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		EmbeddedIOServices::ITimerService * const timerService = serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID);
		const float tdc = IService::CastAndOffset<float>(config, sizeOut);
		IOperation<void, ScalarVariable> * const ignitionOutputOperation = serviceLocator->LocateAndCast<IOperation<void, ScalarVariable>>(BUILDER_OPERATION, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));

		return new Operation_EngineScheduleIgnition(timerService, tdc, ignitionOutputOperation);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_EngineScheduleIgnition, 2005)
}
#endif