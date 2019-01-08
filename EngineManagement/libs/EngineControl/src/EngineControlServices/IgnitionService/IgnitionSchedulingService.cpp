#include "EngineControlServices/IgnitionService/IgnitionSchedulingService.h"

#ifdef IGNITIONSCHEDULINGSERVICE_H
namespace EngineControlServices
{
	IgnitionSchedulingService::IgnitionSchedulingService(
		IgnitionSchedulingServiceConfig *ignitionSchedulingServiceConfig,
		IIgnitionConfig *ignitionConfig,
		IBooleanOutputService **ignitorOutputServices,
		ITimerService *timerService,
		ICrankCamDecoder *decoder)
	{
		_ignitionSchedulingServiceConfig = ignitionSchedulingServiceConfig;
		_ignitionConfig = ignitorOutputServices != 0 ? ignitionConfig : 0;
		_timerService = timerService;
		_decoder = decoder;
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
		bool isSequential = _decoder->HasCamPosition();
		if (_ignitionSchedulingServiceConfig->SequentialRequired && !isSequential)
			return;

		float scheduleCamPosition = _decoder->GetCamPosition();
		if (isSequential && scheduleCamPosition > 360)
			scheduleCamPosition -= 360;
		unsigned short camResolution = isSequential ? 720 : 360;
		unsigned int scheduleTickPerDegree = _decoder->GetTickPerDegree();
		unsigned int scheduleTick = _timerService->GetTick();
		unsigned int ticksPerSecond = _timerService->GetTicksPerSecond();
		IgnitionTiming ignitionTiming = _ignitionConfig->GetIgnitionTiming();

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
					float degreesUntilFire = _ignitionSchedulingServiceConfig->IgnitorTdc[ignitor] - (ignitionTiming.IgnitionAdvance64thDegree * 0.015625f) - scheduleCamPosition;
					if (degreesUntilFire < 0)
						degreesUntilFire += camResolution;
					if (degreesUntilFire > camResolution)
						degreesUntilFire -= camResolution >> 2;
					if (degreesUntilFire < 0)
						degreesUntilFire += camResolution;
					unsigned int ignitionFireTick = scheduleTick + (scheduleTickPerDegree * degreesUntilFire);
					_timerService->ReScheduleTask(_ignitorFireTask[ignitor], ignitionFireTick);

					//if ignition is not dwelling yet set both tasks
					if (currentTickPlusSome < _ignitorDwellTask[ignitor]->Tick || (currentTickPlusSome >= 2863311531 && _ignitorDwellTask[ignitor]->Tick < 1431655765))
					{
						unsigned int ignitionDwellTick = ignitionFireTick - (ignitionTiming.IgnitionDwellTime * ticksPerSecond);
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