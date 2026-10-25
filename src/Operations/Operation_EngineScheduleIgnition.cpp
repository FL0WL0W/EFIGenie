#include "Operations/Operation_EngineScheduleIgnition.h"
#include "Config.h"

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;
using namespace EmbeddedIOOperations;

#ifdef OPERATION_ENGINESCHEDULEIGNITION_H
namespace EFIGenie
{
	Operation_EngineScheduleIgnition::Operation_EngineScheduleIgnition(ITimerService * const timerService, OperationArchitecture::AbstractOperation * const operation, const float tdc) :
		_timerService(timerService),
		_operation(operation),
		_tdc(tdc), 
		_dwellTask(new Task([this]() { this->Dwell(); })),
		_igniteTask(new Task([this]() { this->Ignite(); }))
	{ }

	Operation_EngineScheduleIgnition::~Operation_EngineScheduleIgnition()
	{
		_timerService->UnScheduleTask(_dwellTask);
		while(_dwelling) ;
		_timerService->UnScheduleTask(_igniteTask);
		delete _dwellTask;
		delete _igniteTask;
		delete _operation;
	}

	std::tuple<tick_t, tick_t> Operation_EngineScheduleIgnition::Execute(EnginePosition enginePosition, bool enable, float ignitionDwell, float ignitionAdvance, float ignitionDwellMaxDeviation)
	{
		const tick_t ticksPerSecond = _timerService->GetTicksPerSecond();
		tick_t dwellTicks = static_cast<tick_t>(ignitionDwell * ticksPerSecond + 0.5f);
		if(dwellTicks == 0 && ignitionDwell > 0)
			dwellTicks = 1;

		if(enginePosition.Synced == false || !enable)
		{
			_timerService->UnScheduleTask(_dwellTask);
			//if we are dwelling
			if(_dwelling)
			{
				//and have no matching ignition event, schedule one
				if(!_igniteTask->Scheduled)
				{
					const tick_t igniteAt = _lastDwellTick + dwellTicks;
					_timerService->ScheduleTask(_igniteTask, igniteAt);
					_lastDwellTick = 0;
				}

				return std::tuple<tick_t, tick_t>(0, _igniteTask->ScheduledTick);
			}

			return std::tuple<tick_t, tick_t>(0, 0);
		}

		//if sequntial is changing then treat as a brand new dwell with no prior history
		if(_previousSequential != enginePosition.Sequential)
		{
			_timerService->UnScheduleTask(_dwellTask);
			_lastDwellTick = 0;
			_previousSequential = enginePosition.Sequential;
		}

		const uint16_t cycleDegrees = enginePosition.Sequential? 720 : 360;
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const tick_t ticksPerCycle = static_cast<tick_t>(cycleDegrees * ticksPerDegree);
		const tick_t ticksPerCycleHalf = ticksPerCycle / 2;
		const tick_t maxDwellDeviationTicks = static_cast<tick_t>(ignitionDwellMaxDeviation * ticksPerSecond);

		float delta = _tdc - ignitionAdvance - enginePosition.Position;
		delta -= (static_cast<int16_t>(delta) / cycleDegrees) * cycleDegrees;
		if(delta < 0)
			delta += cycleDegrees;
		tick_t igniteAt = static_cast<tick_t>(ticksPerDegree * delta) + enginePosition.CalculatedTick - (ticksPerCycle << 1);		
		tick_t dwellAt = igniteAt - dwellTicks;

		//check _lastDwellTick is within range and _dwellTask is not scheduled
		if( !_dwellTask->Scheduled && 
			(_lastDwellTick == 0 ||
			ITimerService::TickLessThanTick(_lastDwellTick + dwellTicks, enginePosition.CalculatedTick - (ticksPerCycleHalf * 3)) ||
			ITimerService::TickLessThanTick(enginePosition.CalculatedTick + (ticksPerCycleHalf * 3), _lastDwellTick)))
		{
			//if it is not within range, set it to what would be the previous dwell
			_lastDwellTick = dwellAt;
			while(ITimerService::TickLessThanEqualToTick(_lastDwellTick, enginePosition.CalculatedTick - ticksPerCycle))
				_lastDwellTick += ticksPerCycle;
		}
		
		// if we aren't dwelling, schedule dwell
		const tick_t lastDwellTickBeforeDwellingCheck = _lastDwellTick;
		if(!_dwelling)
		{
			while(ITimerService::TickLessThanTick(dwellAt - ticksPerCycleHalf, lastDwellTickBeforeDwellingCheck))
				dwellAt += ticksPerCycle;
			igniteAt = dwellAt + dwellTicks;

			//schedule dwell
			_timerService->ScheduleTask(_dwellTask, dwellAt);
		}

		// if we are dwelling. schedule ignition and next dwell
		if(_dwelling)
		{
			//schedule ignition based off the last dwell tick
			while(ITimerService::TickLessThanTick(dwellAt + ticksPerCycleHalf, _lastDwellTick))
				dwellAt += ticksPerCycle;
			igniteAt = dwellAt + dwellTicks;

			const tick_t minIgniteAt = _lastDwellTick + dwellTicks - maxDwellDeviationTicks;
			const tick_t maxIgniteAt = _lastDwellTick + dwellTicks + maxDwellDeviationTicks;
			if(ITimerService::TickLessThanTick(igniteAt, minIgniteAt))
				igniteAt = minIgniteAt;
			else if(ITimerService::TickLessThanTick(maxIgniteAt, igniteAt))
				igniteAt = maxIgniteAt;

			//schedule ignition
			_timerService->ScheduleTask(_igniteTask, igniteAt);

			//schedule next dwell
			dwellAt += ticksPerCycle;
			_timerService->ScheduleTask(_dwellTask, dwellAt);
		}
		//if we are not dwelling, just use the previously calculated ignition tick.
		else
		{
			_timerService->ScheduleTask(_igniteTask, igniteAt);
		}

		//return the ticks of the dwell and ignition. for debugging purposes
		return std::tuple<tick_t, tick_t>(dwellAt, igniteAt);
	}

	void Operation_EngineScheduleIgnition::Dwell()
	{
		_operation->Execute(true);
		if(!_dwelling)
			_lastDwellTick = _dwellTask->ExecutedTick == 0? 1 : _dwellTask->ExecutedTick;
		_dwelling = true;
	}

	void Operation_EngineScheduleIgnition::Ignite()
	{
		_operation->Execute(false);
		_dwelling = false;
	}

	AbstractOperation *Operation_EngineScheduleIgnition::Create(const void *config, size_t &sizeOut, const ServiceRegistry *serviceRegistry, OperationFactory *factory)
	{
		const float tdc = Config::CastAndOffset<float>(config, sizeOut);
		callback_t dwellCallBack = 0;
		callback_t igniteCallBack = 0;

		size_t size = 0;
		//we own this operation now. Operation_EngineScheduleIgnition must delete it
		AbstractOperation *operation = factory->Create(config, size);
		Config::OffsetConfig(config, sizeOut, size);
		
		return new Operation_EngineScheduleIgnition(serviceRegistry->TryGet<EmbeddedIOServices::ITimerService>(), operation, tdc);
	}
}
#endif
