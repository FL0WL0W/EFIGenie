#include "PistonEngineService.h"

#ifdef PISTONENGINECONTROLLER_H
namespace EngineManagement
{
	PistonEngineService::PistonEngineService(
		PistonEngineConfig *pistonEngineConfig,
		IPistonEngineInjectionConfig *pistonEngineInjectionConfig,
		IBooleanOutputService **injectorOutputServices,
		IPistonEngineIgnitionConfig *pistonEngineIgnitionConfig,
		IBooleanOutputService **ignitorOutputServices,
		ITimerService *timerService,
		IDecoder *decoder)
	{
		_pistonEngineConfig = pistonEngineConfig;
		_pistonEngineInjectionConfig = injectorOutputServices != 0? pistonEngineInjectionConfig : 0;
		_pistonEngineIgnitionConfig = ignitorOutputServices != 0? pistonEngineIgnitionConfig : 0;
		_timerService = timerService;
		_decoder = decoder;
		for (unsigned char cylinder = 1; cylinder <= _pistonEngineConfig->Cylinders; cylinder++)
		{
			if (_pistonEngineInjectionConfig != 0)
			{
				_injectorOpenTask[cylinder] = new Task(&IBooleanOutputService::OutputSetTask, injectorOutputServices[cylinder], false);
				_injectorCloseTask[cylinder] = new Task(&IBooleanOutputService::OutputResetTask, injectorOutputServices[cylinder], false);
			}
			if (_pistonEngineIgnitionConfig != 0)
			{
				_ignitorDwellTask[cylinder] = new Task(&IBooleanOutputService::OutputSetTask, ignitorOutputServices[cylinder], false);
				_ignitorFireTask[cylinder] = new  Task(&IBooleanOutputService::OutputResetTask, ignitorOutputServices[cylinder], false);
			}
		}
	}
	
	void PistonEngineService::ScheduleEvents(void)
	{
		bool isSequential = _decoder->HasCamPosition();
		float scheduleCamPosition = _decoder->GetCamPosition();
		if (isSequential && scheduleCamPosition > 360)
			scheduleCamPosition -= 360;
		unsigned short camResolution = isSequential ? 720 : 360;
		unsigned int scheduleTickPerDegree = _decoder->GetTickPerDegree();
		//unsigned short scheduleRpm = (360000000 / 60) / scheduleTickPerDegree;
		unsigned int scheduleTick = _timerService->GetTick();
		unsigned int ticksPerSecond = _timerService->GetTicksPerSecond();	
		IgnitionTiming ignitionTiming = _pistonEngineIgnitionConfig != 0? _pistonEngineIgnitionConfig->GetIgnitionTiming() : IgnitionTiming();
		
		for (unsigned char cylinder = 0; cylinder < _pistonEngineConfig->Cylinders; cylinder++)
		{
			unsigned int currentTickPlusSome = _timerService->GetTick() + 5;
			if (_pistonEngineInjectionConfig != 0 && isSequential)
			{
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
						float degreesUntilOpen = ((cylinder * 720) / _pistonEngineConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
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
			if (_pistonEngineIgnitionConfig != 0 && (currentTickPlusSome < _ignitorDwellTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _ignitorDwellTask[cylinder]->Tick < 1431655765)) && _pistonEngineIgnitionConfig != 0)
			{
				if (!ignitionTiming.IgnitionEnable)
				{
					_timerService->UnScheduleTask(_ignitorFireTask[cylinder]);
					_timerService->UnScheduleTask(_ignitorDwellTask[cylinder]);
				}
				else
				{
					float degreesUntilFire = ((cylinder * 720) / _pistonEngineConfig->Cylinders) - (ignitionTiming.IgnitionAdvance64thDegree * 0.015625f) - scheduleCamPosition;
					if (degreesUntilFire < 0)
						degreesUntilFire += camResolution;
					if (degreesUntilFire > camResolution)
						degreesUntilFire -= camResolution >> 2;
					if (degreesUntilFire < 0)
						degreesUntilFire += camResolution;
					unsigned int ignitionFireTick = scheduleTick + (scheduleTickPerDegree * degreesUntilFire);
					_timerService->ReScheduleTask(_ignitorFireTask[cylinder], ignitionFireTick);
				
					//if ignition is not dwelling yet set both tasks
					if(currentTickPlusSome < _ignitorDwellTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _ignitorDwellTask[cylinder]->Tick < 1431655765))
					{
						unsigned int ignitionDwellTick = ignitionFireTick - (ignitionTiming.IgnitionDwellTime * ticksPerSecond);
						_timerService->ReScheduleTask(_ignitorDwellTask[cylinder], ignitionDwellTick);
					}
				}
			}
		}
		if (!isSequential && _pistonEngineInjectionConfig != 0)
		{
			if (_pistonEngineConfig->Cylinders % 2)
			{
				//even number of cylinders, run banks in dual cylinder mode
				unsigned char cylindersToGoTo = _pistonEngineConfig->Cylinders >> 2;
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
						float degreesUntilOpen = ((cylinder * 720) / _pistonEngineConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
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
						degreesUntilOpen = ((cylinder * 720) / _pistonEngineConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
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