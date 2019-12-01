#include "Operations/Operation_EngineScheduleInjection.h"
#include "Variables/Variable_Operation.h"

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

	std::tuple<uint32_t, uint32_t> Operation_EngineScheduleInjection::Execute(EnginePosition enginePosition, ScalarVariable injectionPulseWidth, ScalarVariable injectionEndPosition)
	{
		const uint32_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const uint32_t ticksPerCycle = static_cast<uint32_t>((enginePosition.Sequential? 720 : 360) * ticksPerDegree);

		ScalarVariable injectEndAt = _predictor->Execute(injectionEndPosition, enginePosition);
		if(injectEndAt < enginePosition.CalculatedTick)
			injectEndAt = injectEndAt + ticksPerCycle;

		//if we are not alreaday open we want to reschedule the closing time
		if(!_open)
			_timerService->ScheduleTask(_closeTask, injectEndAt.To<uint32_t>());

		//but we always want to schedule the opening time.
		ScalarVariable injectAt = injectEndAt - injectionPulseWidth * ticksPerSecond;

		if(_open && injectAt < enginePosition.CalculatedTick)
			injectAt = injectAt + ticksPerCycle;

		_timerService->ScheduleTask(_openTask, injectAt.To<uint32_t>());

		//return the ticks of the dwell and ignition. for debugging purposes
		return std::tuple<uint32_t, uint32_t>(injectAt.To<uint32_t>(), injectEndAt.To<uint32_t>());
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

	IOPERATION_REGISTERFACTORY_CPP(Operation_EngineScheduleInjection, 2004, std::tuple<uint32_t, uint32_t>, EnginePosition, ScalarVariable, ScalarVariable)
}
#endif