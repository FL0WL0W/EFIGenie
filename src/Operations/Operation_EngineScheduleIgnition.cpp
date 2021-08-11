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
		_igniteCallBack(igniteCallBack)
	{
		_dwellTask = new Task([this]() { this->Dwell(); });
		_igniteTask = new Task([this]() { this->Ignite(); });
	}

	std::tuple<uint32_t, uint32_t> Operation_EngineScheduleIgnition::Execute(EnginePosition enginePosition, bool enable, float ignitionDwell, float ignitionAdvance, float ignitionDwellMaxDeviation)
	{
		if(enginePosition.Synced == false)
			return std::tuple<uint32_t, uint32_t>(0, 0);

		const uint16_t cycleDegrees = enginePosition.Sequential? 720 : 360;
		const uint32_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const uint32_t ticksPerCycle = static_cast<uint32_t>(cycleDegrees * ticksPerDegree);
		const uint32_t dwellTicks = static_cast<uint32_t>(ignitionDwell * ticksPerSecond);
		const uint32_t maxDwellDeviationTicks = ignitionDwellMaxDeviation * ticksPerSecond;

		float delta = _tdc - ignitionAdvance - enginePosition.Position;
		delta -= (static_cast<uint16_t>(delta) / cycleDegrees) * cycleDegrees;
		if(delta < 0)
			delta += cycleDegrees;
		uint32_t igniteAt = static_cast<int64_t>(ticksPerDegree * (delta - cycleDegrees)) + enginePosition.CalculatedTick;		
		uint32_t dwellAt = igniteAt - dwellTicks;

		//if dwelling, then _lastDwellTick is accurate, adjust igniteAt to allow for sufficiently long dwell
		if(_dwelling)
		{
			while(ITimerService::TickLessThanTick(igniteAt + (ticksPerCycle / 2), _lastDwellTick + dwellTicks))
				igniteAt += ticksPerCycle;
			
			//assume plenty of time to schedule next dwell. if not then dwell is saturated.
			dwellAt = igniteAt - dwellTicks + ticksPerCycle;
			//schedule dwell
			if(enable)
				_timerService->ScheduleTask(_dwellTask, dwellAt);
			
			const uint32_t minIgniteAt = _lastDwellTick + dwellTicks - maxDwellDeviationTicks;
			const uint32_t maxIgniteAt = _lastDwellTick + dwellTicks + maxDwellDeviationTicks;
			if(ITimerService::TickLessThanTick(igniteAt, minIgniteAt))
				igniteAt = minIgniteAt;
			else if(ITimerService::TickLessThanTick(maxIgniteAt, igniteAt))
				igniteAt = maxIgniteAt;

			//schedule ignition
			_timerService->ScheduleTask(_igniteTask, igniteAt);

		}
		else
		{
			//if we aren't dwelling, check _lastDwellTick is not too old
			if(ITimerService::TickLessThanTick(_lastDwellTick + dwellTicks, enginePosition.CalculatedTick - ((ticksPerCycle * 3) / 2)))
			{
				//if it is too old, schedule next ignition event by first available cycle
				while(ITimerService::TickLessThanTick(dwellAt, _timerService->GetTick()))
					dwellAt += ticksPerCycle;
				igniteAt = dwellAt + dwellTicks;

				//schedule dwell
				if(enable)
					_timerService->ScheduleTask(_dwellTask, dwellAt);

				//schedule ignition
				_timerService->ScheduleTask(_igniteTask, igniteAt);
			}
			else
			{
				while(ITimerService::TickLessThanTick(igniteAt - (ticksPerCycle / 2), _lastDwellTick + dwellTicks))
					igniteAt += ticksPerCycle;
				dwellAt = igniteAt - dwellTicks;

				//schedule dwell
				if(enable)
				{
					_timerService->ScheduleTask(_dwellTask, dwellAt);
					dwellAt = _dwellTask->Tick;
				}

				const uint32_t minIgniteAt = dwellAt + dwellTicks - maxDwellDeviationTicks;
				const uint32_t maxIgniteAt = dwellAt + dwellTicks + maxDwellDeviationTicks;
				if(ITimerService::TickLessThanTick(igniteAt, minIgniteAt))
					igniteAt = minIgniteAt;
				else if(ITimerService::TickLessThanTick(maxIgniteAt, igniteAt))
					igniteAt = maxIgniteAt;

				//schedule ignition
				_timerService->ScheduleTask(_igniteTask, igniteAt);
			}
		}

		//return the ticks of the dwell and ignition. for debugging purposes
		return std::tuple<uint32_t, uint32_t>(dwellAt, igniteAt);
	}

	void Operation_EngineScheduleIgnition::Dwell()
	{
		_dwellCallBack();
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