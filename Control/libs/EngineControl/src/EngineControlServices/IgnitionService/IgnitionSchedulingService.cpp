#include "EngineControlServices/IgnitionService/IgnitionSchedulingService.h"

#ifdef IGNITIONSCHEDULINGSERVICE_H
namespace EngineControlServices
{
	IgnitionSchedulingService::IgnitionSchedulingService(
		const IgnitionSchedulingServiceConfig *ignitionSchedulingServiceConfig,
		IIgnitionConfig *ignitionConfig,
		IBooleanOutputService **ignitorOutputServices,
		ITimerService *timerService,
		IReluctor *crankReluctor,
		IReluctor *camReluctor)
	{
		_ignitionSchedulingServiceConfig = ignitionSchedulingServiceConfig;
		_ignitionConfig = ignitorOutputServices != 0 ? ignitionConfig : 0;
		_timerService = timerService;
		_crankReluctor = crankReluctor;
		_camReluctor = camReluctor;
		_ignitorDwellTask = (HardwareAbstraction::Task **)malloc(sizeof(HardwareAbstraction::Task *) * _ignitionSchedulingServiceConfig->Ignitors);
		_ignitorFireTask = (HardwareAbstraction::Task **)malloc(sizeof(HardwareAbstraction::Task *) * _ignitionSchedulingServiceConfig->Ignitors);
		int tickMinusSome = _timerService->GetTick() - 6;
		for (unsigned char ignitor = 0; ignitor < _ignitionSchedulingServiceConfig->Ignitors; ignitor++)
		{
			if (_ignitionConfig != 0)
			{
				_ignitorDwellTask[ignitor] = new Task(&IBooleanOutputService::OutputSetCallBack, ignitorOutputServices[ignitor], false);
				_ignitorDwellTask[ignitor]->Tick = tickMinusSome;
				_ignitorFireTask[ignitor] = new  Task(&IBooleanOutputService::OutputResetCallBack, ignitorOutputServices[ignitor], false);
				_ignitorFireTask[ignitor]->Tick = tickMinusSome;
			}
		}
	}

	void IgnitionSchedulingService::ScheduleEvents(void)
	{
		bool isSequential;
		float schedulePosition;//0-720 when sequential and 0-360 otherwise
		uint32_t scheduleTickPerDegree;
		if(_crankReluctor != 0 && _crankReluctor->IsSynced())
		{
			if(_camReluctor != 0 && _camReluctor->IsSynced())
			{
				//we have both crank and cam
				//decide which one to use for scheduling.
				if(_camReluctor->GetResolution() <= _crankReluctor->GetResolution() * 2)
				{
					schedulePosition = _crankReluctor->GetPosition();
					scheduleTickPerDegree = _crankReluctor->GetTickPerDegree();
					if(_camReluctor->GetPosition() >= 180)
					{
						//we are on the second half of the cam
						schedulePosition += 360;
					}
				}
				else
				{
					//the crank reluctor is essential useless unless the cam sensor goes out of sync
					schedulePosition = _camReluctor->GetPosition() * 2;
					scheduleTickPerDegree = _camReluctor->GetTickPerDegree() * 2;
				}
				isSequential = true;
			}
			else
			{
				//we only have the crank sensor
				if (_ignitionSchedulingServiceConfig->SequentialRequired)
					return;
				schedulePosition = _crankReluctor->GetPosition();
				scheduleTickPerDegree = _camReluctor->GetTickPerDegree() * 2;
				isSequential = false;
			}
		}
		else if(_camReluctor != 0 && _camReluctor->IsSynced())
		{
			//we only have the cam sensor
			schedulePosition = _camReluctor->GetPosition() * 2;
			isSequential = true;
		}
		else
		{
			//we dont have any reluctors to use for scheduling
			return;
		}

		uint32_t scheduleTick = _timerService->GetTick();
		uint32_t ticksPerSecond = _timerService->GetTicksPerSecond();	
		
		unsigned short scheduleResolution = isSequential ? 720 : 360;
		IgnitionTiming ignitionTiming = _ignitionConfig->GetIgnitionTiming();

		const unsigned short *ignitorTdc = _ignitionSchedulingServiceConfig->IgnitorTdc();

		for (unsigned char ignitor = 0; ignitor < _ignitionSchedulingServiceConfig->Ignitors; ignitor++)
		{
			unsigned int currentTickPlusSome = _timerService->GetTick() + 5;
			if (currentTickPlusSome < _ignitorDwellTask[ignitor]->Tick || (currentTickPlusSome >= 2863311531 && _ignitorDwellTask[ignitor]->Tick < 1431655765))
			{
				if (!ignitionTiming.IgnitionEnable)
				{
					_timerService->UnScheduleTask(_ignitorFireTask[ignitor]);
					_timerService->UnScheduleTask(_ignitorDwellTask[ignitor]);
				}
				else
				{
					float degreesUntilFire = ignitorTdc[ignitor] - (ignitionTiming.IgnitionAdvance64thDegree * 0.015625f) - schedulePosition;
					if (degreesUntilFire < 0)
						degreesUntilFire += scheduleResolution;
					if (degreesUntilFire > scheduleResolution)
						degreesUntilFire -= scheduleResolution >> 2;
					if (degreesUntilFire < 0)
						degreesUntilFire += scheduleResolution;
					unsigned int ignitionFireTick = (unsigned int)round(scheduleTick + (scheduleTickPerDegree * degreesUntilFire));
					_timerService->ReScheduleTask(_ignitorFireTask[ignitor], ignitionFireTick);

					//if ignition is not dwelling yet set both tasks
					if (currentTickPlusSome < _ignitorDwellTask[ignitor]->Tick || (currentTickPlusSome >= 2863311531 && _ignitorDwellTask[ignitor]->Tick < 1431655765))
					{
						unsigned int ignitionDwellTick = (unsigned int)round(ignitionFireTick - (ignitionTiming.IgnitionDwellTime * ticksPerSecond));
						_timerService->ReScheduleTask(_ignitorDwellTask[ignitor], ignitionDwellTick);
					}
				}
			}
		}
	}

	void IgnitionSchedulingService::ScheduleEventsCallBack(void *ignitionSchedulingService)
	{
		((IgnitionSchedulingService*)ignitionSchedulingService)->ScheduleEvents();
	}
}
#endif