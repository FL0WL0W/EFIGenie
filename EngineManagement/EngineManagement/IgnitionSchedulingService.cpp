#include "IgnitionSchedulingService.h"

#ifdef IGNITIONSCHEDULINGSERVICE_H
namespace EngineManagement
{
	IgnitionSchedulingService::IgnitionSchedulingService(
		IgnitionSchedulingServiceConfig *ignitionSchedulingServiceConfig,
		IPistonEngineIgnitionConfig *pistonEngineIgnitionConfig,
		IBooleanOutputService **ignitorOutputServices,
		ITimerService *timerService,
		IDecoder *decoder)
	{
		_ignitionSchedulingServiceConfig = ignitionSchedulingServiceConfig;
		_pistonEngineIgnitionConfig = ignitorOutputServices != 0 ? pistonEngineIgnitionConfig : 0;
		_timerService = timerService;
		_decoder = decoder;
		for (unsigned char cylinder = 1; cylinder <= _ignitionSchedulingServiceConfig->Cylinders; cylinder++)
		{
			if (_pistonEngineIgnitionConfig != 0)
			{
				_ignitorDwellTask[cylinder] = new Task(&IBooleanOutputService::OutputSetTask, ignitorOutputServices[cylinder], false);
				_ignitorFireTask[cylinder] = new  Task(&IBooleanOutputService::OutputResetTask, ignitorOutputServices[cylinder], false);
			}
		}
	}

	void IgnitionSchedulingService::ScheduleEvents(void)
	{
		bool isSequential = _decoder->HasCamPosition();
		float scheduleCamPosition = _decoder->GetCamPosition();
		if (isSequential && scheduleCamPosition > 360)
			scheduleCamPosition -= 360;
		unsigned short camResolution = isSequential ? 720 : 360;
		unsigned int scheduleTickPerDegree = _decoder->GetTickPerDegree();
		unsigned int scheduleTick = _timerService->GetTick();
		unsigned int ticksPerSecond = _timerService->GetTicksPerSecond();
		IgnitionTiming ignitionTiming = _pistonEngineIgnitionConfig->GetIgnitionTiming();

		for (unsigned char cylinder = 0; cylinder < _ignitionSchedulingServiceConfig->Cylinders; cylinder++)
		{
			unsigned int currentTickPlusSome = _timerService->GetTick() + 5;
			if (currentTickPlusSome < _ignitorDwellTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _ignitorDwellTask[cylinder]->Tick < 1431655765))
			{
				if (!ignitionTiming.IgnitionEnable)
				{
					_timerService->UnScheduleTask(_ignitorFireTask[cylinder]);
					_timerService->UnScheduleTask(_ignitorDwellTask[cylinder]);
				}
				else
				{
					float degreesUntilFire = ((cylinder * 720) / _ignitionSchedulingServiceConfig->Cylinders) - (ignitionTiming.IgnitionAdvance64thDegree * 0.015625f) - scheduleCamPosition;
					if (degreesUntilFire < 0)
						degreesUntilFire += camResolution;
					if (degreesUntilFire > camResolution)
						degreesUntilFire -= camResolution >> 2;
					if (degreesUntilFire < 0)
						degreesUntilFire += camResolution;
					unsigned int ignitionFireTick = scheduleTick + (scheduleTickPerDegree * degreesUntilFire);
					_timerService->ReScheduleTask(_ignitorFireTask[cylinder], ignitionFireTick);

					//if ignition is not dwelling yet set both tasks
					if (currentTickPlusSome < _ignitorDwellTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _ignitorDwellTask[cylinder]->Tick < 1431655765))
					{
						unsigned int ignitionDwellTick = ignitionFireTick - (ignitionTiming.IgnitionDwellTime * ticksPerSecond);
						_timerService->ReScheduleTask(_ignitorDwellTask[cylinder], ignitionDwellTick);
					}
				}
			}
		}
	}
}
#endif