#include "EngineControlServices/InjectionService/InjectionSchedulingService.h"

#ifdef INJECTIONSCHEDULINGSERVICE_H
namespace EngineControlServices
{
	InjectionSchedulingService::InjectionSchedulingService(
		const InjectionSchedulingServiceConfig *injectionSchedulingServiceConfig,
		IInjectionConfig *injectionConfig,
		IBooleanOutputService **injectorOutputServices,
		ITimerService *timerService,
		IReluctor *crankReluctor,
		IReluctor *camReluctor)
	{
		_injectionSchedulingServiceConfig = injectionSchedulingServiceConfig;
		_injectionConfig = injectorOutputServices != 0? injectionConfig : 0;
		_timerService = timerService;
		_crankReluctor = crankReluctor;
		_camReluctor = camReluctor;
		_injectorOpenTask = (HardwareAbstraction::Task **)malloc(sizeof(HardwareAbstraction::Task *) * _injectionSchedulingServiceConfig->Injectors);
		_injectorCloseTask = (HardwareAbstraction::Task **)malloc(sizeof(HardwareAbstraction::Task *) * _injectionSchedulingServiceConfig->Injectors);
		int tickMinusSome = _timerService->GetTick() - 6;
		for (unsigned char injector = 0; injector < _injectionSchedulingServiceConfig->Injectors; injector++)
		{
			if (_injectionConfig != 0)
			{
				_injectorOpenTask[injector] = new Task(&IBooleanOutputService::OutputSetCallBack, injectorOutputServices[injector], false);
				_injectorOpenTask[injector]->Tick = tickMinusSome;
				_injectorCloseTask[injector] = new Task(&IBooleanOutputService::OutputResetCallBack, injectorOutputServices[injector], false);
				_injectorCloseTask[injector]->Tick = tickMinusSome;
			}
		}
	}
	
	void InjectionSchedulingService::ScheduleEvents(void)
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

		const unsigned short *injectorTdc = _injectionSchedulingServiceConfig->InjectorTdc();

		if (isSequential)
		{
			for (unsigned char injector = 0; injector < _injectionSchedulingServiceConfig->Injectors; injector++)
			{
				unsigned int currentTickPlusSome = _timerService->GetTick() + 5;
				if (currentTickPlusSome < _injectorOpenTask[injector]->Tick || (currentTickPlusSome >= 2863311531 && _injectorOpenTask[injector]->Tick < 1431655765))
				{
					InjectorTiming injectorTiming = _injectionConfig->GetInjectorTiming(injector);
					if (injectorTiming.PulseWidth == 0)
					{
						_timerService->UnScheduleTask(_injectorOpenTask[injector]);
						_timerService->UnScheduleTask(_injectorCloseTask[injector]);
					}
					else
					{
						float injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						unsigned int injectorPulseWidthTick = (unsigned int)round(injectorTiming.PulseWidth * ticksPerSecond);

						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						float degreesUntilOpen = injectorTdc[injector] + injectorStartPosition - schedulePosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						unsigned int injectorOpenTick = (unsigned int)round(scheduleTick + (scheduleTickPerDegree * degreesUntilOpen));
						unsigned int injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						_timerService->ReScheduleTask(_injectorOpenTask[injector], injectorOpenTick);
						_timerService->ReScheduleTask(_injectorCloseTask[injector], injectorCloseTick);
					}
				}
			}
		}
		else
		{
			if (_injectionSchedulingServiceConfig->Injectors % 2 == 0)
			{
				//even number of injectors, run banks in dual injector mode
				unsigned char injectosToGoTo = _injectionSchedulingServiceConfig->Injectors >> 2;
				for (unsigned char injector = 0; injector < injectosToGoTo; injector+=2)
				{
					unsigned int currentTickPlusSome = _timerService->GetTick() + 5;
					if (currentTickPlusSome < _injectorOpenTask[injector]->Tick || (currentTickPlusSome >= 2863311531 && _injectorOpenTask[injector]->Tick < 1431655765))
					{
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						InjectorTiming injectorTiming = _injectionConfig->GetInjectorTiming(injector);
						float injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						unsigned int injectorPulseWidthTick = (unsigned int)round(injectorTiming.PulseWidth * ticksPerSecond);
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						float degreesUntilOpen = injectorTdc[injector] + injectorStartPosition - schedulePosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						unsigned int injectorOpenTick = (unsigned int)round(scheduleTick + (scheduleTickPerDegree * degreesUntilOpen));
						unsigned int injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						_timerService->ReScheduleTask(_injectorOpenTask[injector], injectorOpenTick);
						_timerService->ReScheduleTask(_injectorCloseTask[injector], injectorCloseTick);
						
						injectorTiming = _injectionConfig->GetInjectorTiming(injector + injectosToGoTo);
						injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						injectorPulseWidthTick = (unsigned int)round(injectorTiming.PulseWidth * ticksPerSecond);
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						degreesUntilOpen = injectorTdc[injector + injectosToGoTo] + injectorStartPosition - schedulePosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						injectorOpenTick = (unsigned int)round(scheduleTick + (scheduleTickPerDegree * degreesUntilOpen));
						injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						_timerService->ReScheduleTask(_injectorOpenTask[injector + injectosToGoTo], injectorOpenTick);
						_timerService->ReScheduleTask(_injectorCloseTask[injector + injectosToGoTo], injectorCloseTick);
					}
				}
			}
		}
	}

	void InjectionSchedulingService::ScheduleEventsCallBack(void *injectionSchedulingService)
	{
		((InjectionSchedulingService*)injectionSchedulingService)->ScheduleEvents();
	}
}
#endif