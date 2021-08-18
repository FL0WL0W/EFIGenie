#include "Operations/Operation_EngineScheduleIgnition.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINESCHEDULEIGNITION_H
namespace OperationArchitecture
{
	Operation_EngineScheduleIgnition::Operation_EngineScheduleIgnition(ITimerService *timerService, const float tdc, std::function<void()> dwellCallBack, std::function<void()> igniteCallBack) :
		_timerService(timerService),
		_tdc(tdc), 
		_dwellCallBack(dwellCallBack),
		_igniteCallBack(igniteCallBack),
		_dwellTask(new Task([this]() { this->Dwell(); })),
		_igniteTask(new Task([this]() { this->Ignite(); }))
	{ }

	Operation_EngineScheduleIgnition::~Operation_EngineScheduleIgnition()
	{
		_timerService->UnScheduleTask(_dwellTask);
		_timerService->UnScheduleTask(_igniteTask);
		_igniteCallBack();
		delete _dwellTask;
		delete _igniteTask;
	}

	std::tuple<tick_t, tick_t> Operation_EngineScheduleIgnition::Execute(EnginePosition enginePosition, bool enable, float ignitionDwell, float ignitionAdvance, float ignitionDwellMaxDeviation)
	{
		if(enginePosition.Synced == false)
			return std::tuple<tick_t, tick_t>(0, 0);

		const uint16_t cycleDegrees = enginePosition.Sequential? 720 : 360;
		const tick_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const tick_t ticksPerCycle = static_cast<tick_t>(cycleDegrees * ticksPerDegree);
		const tick_t dwellTicks = static_cast<tick_t>(ignitionDwell * ticksPerSecond);
		const tick_t maxDwellDeviationTicks = ignitionDwellMaxDeviation * ticksPerSecond;

		float delta = _tdc - ignitionAdvance - enginePosition.Position;
		delta -= (static_cast<uint16_t>(delta) / cycleDegrees) * cycleDegrees;
		if(delta < 0)
			delta += cycleDegrees;
		tick_t igniteAt = static_cast<int64_t>(ticksPerDegree * (delta - cycleDegrees)) + enginePosition.CalculatedTick;		
		tick_t dwellAt = igniteAt - dwellTicks;

		//if dwelling, then _lastDwellTick is accurate, adjust igniteAt to allow for sufficiently long dwell
		tick_t lastDwellTickCapturedBeforeDwellingCheck = _lastDwellTick;
		if(_dwelling)
		{
			while(ITimerService::TickLessThanTick(igniteAt + (ticksPerCycle / 2), _lastDwellTick + dwellTicks))
				igniteAt += ticksPerCycle;
			
			//assume plenty of time to schedule next dwell. if not then dwell is saturated.
			dwellAt = igniteAt - dwellTicks + ticksPerCycle;
			//schedule dwell
			if(enable)
				_timerService->ScheduleTask(_dwellTask, dwellAt);
			
			const tick_t minIgniteAt = _lastDwellTick + dwellTicks - maxDwellDeviationTicks;
			const tick_t maxIgniteAt = _lastDwellTick + dwellTicks + maxDwellDeviationTicks;
			if(ITimerService::TickLessThanTick(igniteAt, minIgniteAt))
				igniteAt = minIgniteAt;
			else if(ITimerService::TickLessThanTick(maxIgniteAt, igniteAt))
				igniteAt = maxIgniteAt;

			_timerService->ScheduleTask(_igniteTask, igniteAt);
		}
		else
		{
			//if we aren't dwelling, check _lastDwellTick is within range
			if( ITimerService::TickLessThanTick(lastDwellTickCapturedBeforeDwellingCheck + dwellTicks, enginePosition.CalculatedTick - ((ticksPerCycle * 3) / 2)) ||
				ITimerService::TickLessThanTick(enginePosition.CalculatedTick + ((ticksPerCycle * 3) / 2), lastDwellTickCapturedBeforeDwellingCheck))
			{
				//if it is not within range, set it to what would have been the last cycle
				lastDwellTickCapturedBeforeDwellingCheck = dwellAt - ticksPerCycle;
				while(ITimerService::TickLessThanTick(lastDwellTickCapturedBeforeDwellingCheck, _timerService->GetTick() - ticksPerCycle))
					lastDwellTickCapturedBeforeDwellingCheck += ticksPerCycle;
			}

			while(ITimerService::TickLessThanTick(igniteAt - (ticksPerCycle / 2), lastDwellTickCapturedBeforeDwellingCheck + dwellTicks))
				igniteAt += ticksPerCycle;
			dwellAt = igniteAt - dwellTicks;

			//schedule dwell
			if(enable)
			{
				_timerService->ScheduleTask(_dwellTask, dwellAt);
				dwellAt = _dwellTask->Tick;
			}

			const tick_t minIgniteAt = dwellAt + dwellTicks - maxDwellDeviationTicks;
			const tick_t maxIgniteAt = dwellAt + dwellTicks + maxDwellDeviationTicks;
			if(ITimerService::TickLessThanTick(igniteAt, minIgniteAt))
				igniteAt = minIgniteAt;
			else if(ITimerService::TickLessThanTick(maxIgniteAt, igniteAt))
				igniteAt = maxIgniteAt;

			_timerService->ScheduleTask(_igniteTask, igniteAt);
		}

		//return the ticks of the dwell and ignition. for debugging purposes
		return std::tuple<tick_t, tick_t>(dwellAt, igniteAt);
	}

	void Operation_EngineScheduleIgnition::Dwell()
	{
		_dwellCallBack();
		if(!_dwelling)
			_lastDwellTick = _dwellTask->Tick;
		_dwelling = true;
	}

	void Operation_EngineScheduleIgnition::Ignite()
	{
		_igniteCallBack();
		_dwelling = false;
	}

	IOperationBase *Operation_EngineScheduleIgnition::Create(const void *config, size_t &sizeOut, const EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager)
	{
		const float tdc = Config::CastAndOffset<float>(config, sizeOut);
		std::function<void()> dwellCallBack = 0;
		std::function<void()> igniteCallBack = 0;

		size_t size = 0;
		IOperationBase *operation = packager->Package(config, size);
		Config::OffsetConfig(config, sizeOut, size);
		if(operation->NumberOfParameters == 1)
		{
			dwellCallBack = [operation]() { operation->Execute(true); };
			igniteCallBack = [operation]() { operation->Execute(false); };
		}
		else
		{
			dwellCallBack = [operation]() { operation->Execute(); };

			size = 0;
			IOperationBase *operation = packager->Package(config, size);
			Config::OffsetConfig(config, sizeOut, size);
			igniteCallBack = [operation]() { operation->Execute(); };
		}
		
		return new Operation_EngineScheduleIgnition(embeddedIOServiceCollection->TimerService, tdc, dwellCallBack, igniteCallBack);
	}
}
#endif