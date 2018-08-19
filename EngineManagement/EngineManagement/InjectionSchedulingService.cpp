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
		_injectorOpenTask = (HardwareAbstraction::Task **)malloc(sizeof(HardwareAbstraction::Task *) * _injectionSchedulingServiceConfig->Injectors);
		_injectorCloseTask = (HardwareAbstraction::Task **)malloc(sizeof(HardwareAbstraction::Task *) * _injectionSchedulingServiceConfig->Injectors);
		int tickMinusSome = _timerService->GetTick() - 6;
		for (unsigned char injector = 0; injector < _injectionSchedulingServiceConfig->Injectors; injector++)
		{
			if (_pistonEngineInjectionConfig != 0)
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
		bool isSequential = _decoder->HasCamPosition();
		float scheduleCamPosition = _decoder->GetCamPosition();
		if (isSequential && scheduleCamPosition > 360)
			scheduleCamPosition -= 360;
		unsigned int scheduleTickPerDegree = _decoder->GetTickPerDegree();
		unsigned int scheduleTick = _timerService->GetTick();
		unsigned int ticksPerSecond = _timerService->GetTicksPerSecond();	

		if (isSequential)
		{
			for (unsigned char injector = 0; injector < _injectionSchedulingServiceConfig->Injectors; injector++)
			{
				unsigned int currentTickPlusSome = _timerService->GetTick() + 5;
				if (currentTickPlusSome < _injectorOpenTask[injector]->Tick || (currentTickPlusSome >= 2863311531 && _injectorOpenTask[injector]->Tick < 1431655765))
				{
					InjectorTiming injectorTiming = _pistonEngineInjectionConfig->GetInjectorTiming(injector);
					if (injectorTiming.PulseWidth == 0)
					{
						_timerService->UnScheduleTask(_injectorOpenTask[injector]);
						_timerService->UnScheduleTask(_injectorCloseTask[injector]);
					}
					else
					{
						float injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						unsigned int injectorPulseWidthTick = injectorTiming.PulseWidth * ticksPerSecond;

						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						float degreesUntilOpen = _injectionSchedulingServiceConfig->InjectorTdc[injector] + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						unsigned int injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
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
						InjectorTiming injectorTiming = _pistonEngineInjectionConfig->GetInjectorTiming(injector);
						float injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						unsigned int injectorPulseWidthTick = injectorTiming.PulseWidth * ticksPerSecond;
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						float degreesUntilOpen = _injectionSchedulingServiceConfig->InjectorTdc[injector] + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						unsigned int injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
						unsigned int injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						_timerService->ReScheduleTask(_injectorOpenTask[injector], injectorOpenTick);
						_timerService->ReScheduleTask(_injectorCloseTask[injector], injectorCloseTick);
						
						injectorTiming = _pistonEngineInjectionConfig->GetInjectorTiming(injector + injectosToGoTo);
						injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						injectorPulseWidthTick = injectorTiming.PulseWidth * ticksPerSecond;
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						degreesUntilOpen = _injectionSchedulingServiceConfig->InjectorTdc[injector + injectosToGoTo] + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
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