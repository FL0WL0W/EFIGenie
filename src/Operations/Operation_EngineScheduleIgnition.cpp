#include "Operations/Operation_EngineScheduleIgnition.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINESCHEDULEIGNITION_H
namespace OperationArchitecture
{
	Operation_EngineScheduleIgnition::Operation_EngineScheduleIgnition(ITimerService *timerService, Operation_EnginePositionPrediction *predictor, float tdc, std::function<void()> dwellCallBack, std::function<void()> igniteCallBack)
	{
		_timerService = timerService;
		_tdc = tdc;
		_predictor = predictor;
		_dwellCallBack = dwellCallBack;
		_igniteCallBack = igniteCallBack;
		//_dwellTask = new Task([this]() { this->Dwell(); }, false);
		_dwellTask = new Task([this]() { this->Dwell(); });
		_igniteTask = new Task([this]() { this->Ignite(); });
	}

	std::tuple<uint32_t, uint32_t> Operation_EngineScheduleIgnition::Execute(EnginePosition enginePosition, float ignitionDwell, float ignitionAdvance)
	{
		if(enginePosition.Synced == false)
			return std::tuple<uint32_t, uint32_t>(0, 0);

		const uint32_t ticksPerSecond = _timerService->GetTicksPerSecond();
		const float ticksPerDegree = ticksPerSecond / enginePosition.PositionDot;
		const uint32_t ticksPerCycle = static_cast<uint32_t>((enginePosition.Sequential? 720 : 360) * ticksPerDegree);
		//we only want to change the timing when we are not dwelling. otherwise our dwell could be too short or too long.
		if(_dwellingAtTick == 0)
		{
			_ignitionAt = _tdc - ignitionAdvance;
			_ignitionDwell = ignitionDwell;
		}

		//we want to set the next dwell tick if ignitionDwell is > 0
		uint32_t dwellTick = 0;
		if(ignitionDwell > 0)
		{
			uint32_t dwellTicks = static_cast<uint32_t>(ignitionDwell * ticksPerSecond);
			dwellTick = _predictor->Execute(_tdc - ignitionAdvance, enginePosition);
			dwellTick = dwellTick - dwellTicks;
			while(ITimerService::TickLessThanTick(dwellTick, enginePosition.CalculatedTick))
				dwellTick = dwellTick + ticksPerCycle;

			_timerService->ScheduleTask(_dwellTask, dwellTick);
			dwellTick = dwellTick == 0? 1 : dwellTick;
		}
		//otherwise we want to unschedule the dwell
		else
		{
			if(_dwellTask->Scheduled)
			{
				_timerService->UnScheduleTask(_dwellTask);
			}
		}

		//but we do want to adjust the ignition tick so that it is spot on
		uint32_t ignitionTick = _predictor->Execute(_ignitionAt, enginePosition);
		//if the prediction is for a previous position. add for next position
		while((_dwellingAtTick == 0 && ITimerService::TickLessThanTick(ignitionTick, enginePosition.CalculatedTick)) || (_dwellingAtTick != 0 && ITimerService::TickLessThanTick(ignitionTick, _dwellingAtTick)))
			ignitionTick = ignitionTick + ticksPerCycle;

		if(_dwellingAtTick == 0)
			_timerService->ScheduleTask(_igniteTask, ignitionTick);
		else
		{
			const uint32_t currDwellTicks = _ignitionDwell * ticksPerSecond;
			_timerService->ScheduleTask(_igniteTask, ignitionTick - _dwellingAtTick > currDwellTicks * 2 / 3?  _dwellingAtTick + currDwellTicks : ignitionTick);
		}

		//return the ticks of the dwell and ignition. for debugging purposes
		return std::tuple<uint32_t, uint32_t>(dwellTick, ignitionTick == 0? 1 : ignitionTick);
	}

	void Operation_EngineScheduleIgnition::Dwell()
	{
		_dwellCallBack();
		_dwellingAtTick = _dwellTask->Tick;
		if(_dwellingAtTick == 0)
			_dwellingAtTick = 1;
	}

	void Operation_EngineScheduleIgnition::Ignite()
	{
		_igniteCallBack();
		_dwellingAtTick = 0;
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
		
		return new Operation_EngineScheduleIgnition(embeddedIOServiceCollection->TimerService, new Operation_EnginePositionPrediction(embeddedIOServiceCollection->TimerService), tdc, dwellCallBack, igniteCallBack);
	}
}
#endif