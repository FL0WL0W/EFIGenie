#include "Operations/Operation_EngineScheduleInjection.h"

#ifdef OPERATION_ENGINESCHEDULEINJECTION_H
namespace Operations
{
	Operation_EngineScheduleInjection::Operation_EngineScheduleInjection(HardwareAbstraction::ITimerService *timerService, float tdc, IOperation<void, ScalarVariable> *injectionOutputOperation)
	{
		_timerService = timerService;
		_tdc = tdc;
		_predictor = Operation_EnginePositionPrediction::Construct(timerService);
		_injectionOutputOperation = injectionOutputOperation;
		_openTask = new HardwareAbstraction::Task(new CallBack<Operation_EngineScheduleInjection>(this, &Operation_EngineScheduleInjection::Open), false);
		_closeTask = new HardwareAbstraction::Task(new CallBack<Operation_EngineScheduleInjection>(this, &Operation_EngineScheduleInjection::Close), false);
	}

	std::tuple<ScalarVariable, ScalarVariable> Operation_EngineScheduleInjection::Execute(EnginePosition enginePosition, ScalarVariable injectionPulseWidth, ScalarVariable injectionEndPosition)
	{
		if(enginePosition.Synced == false)
			return std::tuple<ScalarVariable, ScalarVariable>(ScalarVariable(false), ScalarVariable(false));

		const uint32_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const uint32_t ticksPerCycle = static_cast<uint32_t>((enginePosition.Sequential? 720 : 360) * ticksPerDegree);

		uint32_t injectEndAt = _predictor->Execute(ScalarVariable(_tdc) + injectionEndPosition, enginePosition).To<uint32_t>();;
		//we always want to schedule the opening time.
		uint32_t injectAt = injectEndAt - static_cast<uint32_t>((injectionPulseWidth.To<float>() * (enginePosition.Sequential? 1 : 0.5f)) * ticksPerSecond);
		while(HardwareAbstraction::ITimerService::TickLessThanTick(injectAt, enginePosition.CalculatedTick))
			injectAt = injectAt + ticksPerCycle;

		_timerService->ScheduleTask(_openTask, injectAt);

		while(HardwareAbstraction::ITimerService::TickLessThanTick(injectEndAt, enginePosition.CalculatedTick))
			injectEndAt = injectEndAt + ticksPerCycle;

		//if we are not already open we want to reschedule the closing time
		if(!_open)
			_timerService->ScheduleTask(_closeTask, injectEndAt);

		//return the ticks of the open and close. for debugging purposes
		return std::tuple<ScalarVariable, ScalarVariable>(ScalarVariable::FromTick(injectAt), ScalarVariable::FromTick(injectEndAt));
	}

	void Operation_EngineScheduleInjection::Open()
	{
		_injectionOutputOperation->Execute(true);
		_open = true;
	}

	void Operation_EngineScheduleInjection::Close()
	{
		_injectionOutputOperation->Execute(false);
		_open = false;
	}

	Operations::IOperationBase *Operation_EngineScheduleInjection::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		HardwareAbstraction::ITimerService * const timerService = serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID);
		const float tdc = IService::CastAndOffset<float>(config, sizeOut);
		IOperation<void, ScalarVariable> * const injectionOutputOperation = serviceLocator->LocateAndCast<Operations::IOperation<void, ScalarVariable>>(BUILDER_OPERATION, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));

		return new Operation_EngineScheduleInjection(timerService, tdc, injectionOutputOperation);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_EngineScheduleInjection, 2004)
}
#endif