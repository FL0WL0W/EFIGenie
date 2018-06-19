#include "InjectionSchedulingService.h"

#ifdef INJECTIONSCHEDULINGSERVICE_H
namespace EngineManagement
{
	InjectionSchedulingService::InjectionSchedulingService(
		InjectionSchedulingServiceConfig *injectionSchedulingServiceConfig,
		IPistonEngineInjectionConfig *pistonEngineInjectionConfig,
		IBooleanOutputService **injectorOutputServices,
		ITimerService *timerService,
		IDecoder *decoder)
	{
		_injectionSchedulingServiceConfig = injectionSchedulingServiceConfig;
		_pistonEngineInjectionConfig = injectorOutputServices != 0? pistonEngineInjectionConfig : 0;
		_timerService = timerService;
		_decoder = decoder;
		for (unsigned char cylinder = 1; cylinder <= _injectionSchedulingServiceConfig->Cylinders; cylinder++)
		{
			if (_pistonEngineInjectionConfig != 0)
			{
				_injectorOpenTask[cylinder] = new Task(&IBooleanOutputService::OutputSetTask, injectorOutputServices[cylinder], false);
				_injectorCloseTask[cylinder] = new Task(&IBooleanOutputService::OutputResetTask, injectorOutputServices[cylinder], false);
			}
		}
	}
	
	void InjectionSchedulingService::ScheduleEvents(void)
	{
		bool isSequential = _decoder->HasCamPosition();
		float scheduleCamPosition = _decoder->GetCamPosition();
		if (isSequential && scheduleCamPosition > 360)
			scheduleCamPosition -= 360;
		unsigned int scheduleTickPerDegree = _decoder->GetTickPerDegree();
		unsigned int scheduleTick = _timerService->GetTick();
		unsigned int ticksPerSecond = _timerService->GetTicksPerSecond();	

		if (isSequential)
		{
			for (unsigned char cylinder = 0; cylinder < _injectionSchedulingServiceConfig->Cylinders; cylinder++)
			{
				unsigned int currentTickPlusSome = _timerService->GetTick() + 5;
				if (currentTickPlusSome < _injectorOpenTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _injectorOpenTask[cylinder]->Tick < 1431655765))
				{
					InjectorTiming injectorTiming = _pistonEngineInjectionConfig->GetInjectorTiming(cylinder);
					if (injectorTiming.PulseWidth == 0)
					{
						_timerService->UnScheduleTask(_injectorOpenTask[cylinder]);
						_timerService->UnScheduleTask(_injectorCloseTask[cylinder]);
					}
					else
					{
						float injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						unsigned int injectorPulseWidthTick = injectorTiming.PulseWidth * ticksPerSecond;

						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						float degreesUntilOpen = ((cylinder * 720) / _injectionSchedulingServiceConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						unsigned int injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
						unsigned int injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						_timerService->ReScheduleTask(_injectorOpenTask[cylinder], injectorOpenTick);
						_timerService->ReScheduleTask(_injectorCloseTask[cylinder], injectorCloseTick);
					}
				}
			}
		}
		else
		{
			if (_injectionSchedulingServiceConfig->Cylinders % 2 == 0)
			{
				//even number of cylinders, run banks in dual cylinder mode
				unsigned char cylindersToGoTo = _injectionSchedulingServiceConfig->Cylinders >> 2;
				for (unsigned char cylinder = 0; cylinder < cylindersToGoTo; cylinder+=2)
				{
					unsigned int currentTickPlusSome = _timerService->GetTick() + 5;
					if (currentTickPlusSome < _injectorOpenTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _injectorOpenTask[cylinder]->Tick < 1431655765))
					{
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						InjectorTiming injectorTiming = _pistonEngineInjectionConfig->GetInjectorTiming(cylinder);
						float injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						unsigned int injectorPulseWidthTick = injectorTiming.PulseWidth * ticksPerSecond;
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						float degreesUntilOpen = ((cylinder * 720) / _injectionSchedulingServiceConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						unsigned int injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
						unsigned int injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						_timerService->ReScheduleTask(_injectorOpenTask[cylinder], injectorOpenTick);
						_timerService->ReScheduleTask(_injectorCloseTask[cylinder], injectorCloseTick);
						
						injectorTiming = _pistonEngineInjectionConfig->GetInjectorTiming(cylinder + cylindersToGoTo);
						injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						injectorPulseWidthTick = injectorTiming.PulseWidth * ticksPerSecond;
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						degreesUntilOpen = ((cylinder * 720) / _injectionSchedulingServiceConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
						injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						_timerService->ReScheduleTask(_injectorOpenTask[cylinder + cylindersToGoTo], injectorOpenTick);
						_timerService->ReScheduleTask(_injectorCloseTask[cylinder + cylindersToGoTo], injectorCloseTick);
					}
				}
			}
		}
	}
}
#endif