#include "Operations/Operation_EngineScheduleIgnition.h"
#include "Variables/Variable_Operation.h"

#ifdef OPERATION_ENGINESCHEDULEIGNITION_H
namespace Operations
{
	Operation_EngineScheduleIgnition::Operation_EngineScheduleIgnition(HardwareAbstraction::ITimerService *timerService, float tdc, IOperation<void, ScalarVariable> *ignitionOutputOperation)
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
		const uint32_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const uint32_t ticksPerCycle = static_cast<uint32_t>((enginePosition.Sequential? 720 : 360) * ticksPerDegree);

		//we only want to change the timing when we are not dwelling. otherwise our dwell could be too short or too long.
		if(!_dwellingAtTick)
			_ignitionAt = ScalarVariable(_tdc) - ignitionAdvance;

		//but we do want to adjust the ignition tick so that it is spot on
		ScalarVariable ignitionTick = _predictor->Execute(_ignitionAt, enginePosition);
		//if the prediction is for a previous position. add for next position
		if((!_dwellingAtTick && ignitionTick < enginePosition.CalculatedTick) || (_dwellingAtTick && ignitionTick < _dwellingAtTick))
			ignitionTick = ignitionTick + ticksPerCycle;

		_timerService->ScheduleTask(_igniteTask, ignitionTick.To<uint32_t>());

		//we also want to set the next dwell tick
		ScalarVariable dwellTick = _predictor->Execute(ignitionAdvance, enginePosition);
		dwellTick = dwellTick - ScalarVariable::FromTick(ignitionDwell.To<float>() * ticksPerSecond);
		while(HardwareAbstraction::ITimerService::TickLessThanTick(dwellTick.To<uint32_t>(), enginePosition.CalculatedTick))
			dwellTick = dwellTick + ticksPerCycle;

		if(_dwellingAtTick && dwellTick < ignitionTick)
			dwellTick = dwellTick + ticksPerCycle;

		_timerService->ScheduleTask(_dwellTask, ignitionTick.To<uint32_t>());

		//return the ticks of the dwell and ignition. for debugging purposes
		return std::tuple<ScalarVariable, ScalarVariable>(dwellTick, ignitionTick);
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

	Operations::IOperationBase *Operation_EngineScheduleIgnition::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		HardwareAbstraction::ITimerService * const timerService = serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID);
		const float tdc = IService::CastAndOffset<float>(config, sizeOut);
		IOperation<void, ScalarVariable> * const ignitionOutputOperation = serviceLocator->LocateAndCast<Operations::IOperation<void, ScalarVariable>>(BUILDER_OPERATION, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));

		return new Operation_EngineScheduleIgnition(timerService, tdc, ignitionOutputOperation);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_EngineScheduleIgnition, 2003, std::tuple<uint32_t, uint32_t>, EnginePosition, ScalarVariable, ScalarVariable)
}
#endif