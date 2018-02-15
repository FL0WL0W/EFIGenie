#include "Services.h"
#include "PistonEngineConfig.h"
#ifndef NOINJECTION
#include "IPistonEngineInjectionConfig.h"
#endif
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineController.h"

namespace EngineManagement
{
	PistonEngineController::PistonEngineController(
#ifndef NOINJECTION
		IPistonEngineInjectionConfig *pistonEngineInjectionConfig, 
#endif
		IPistonEngineIgnitionConfig *pistonEngineIgnitionConfig, 
		PistonEngineConfig *pistonEngineConfig)
	{
#ifndef NOINJECTION
		_pistonEngineInjectionConfig = pistonEngineInjectionConfig;
#endif
		_pistonEngineConfig = pistonEngineConfig;
		for (unsigned char cylinder = 1; cylinder <= _pistonEngineConfig->Cylinders; cylinder++)
		{
#ifndef NOINJECTION
			_injectorOpenTask[cylinder] = new HardwareAbstraction::Task(&IInjectorService::InjectorOpenTask, CurrentInjectorServices[cylinder], INJECTOR_TASK_PRIORITY, false);
			_injectorCloseTask[cylinder] = new HardwareAbstraction::Task(&IInjectorService::InjectorCloseTask, CurrentInjectorServices[cylinder], INJECTOR_TASK_PRIORITY, false);
#endif
			_ignitorDwellTask[cylinder] = new HardwareAbstraction::Task(&IIgnitorService::CoilDwellTask, CurrentIgnitorServices[cylinder], IGNITION_DWELL_TASK_PRIORITY, false);
			_ignitorFireTask[cylinder] = new HardwareAbstraction::Task(&IIgnitorService::CoilFireTask, CurrentIgnitorServices[cylinder], IGNITION_FIRE_TASK_PRIORITY, false);
		}
	}
	
	void PistonEngineController::ScheduleEvents(void)
	{
		bool isSequential = CurrentDecoder->HasCamPosition();
		float scheduleCamPosition = CurrentDecoder->GetCamPosition();
		if (isSequential && scheduleCamPosition > 360)
			scheduleCamPosition -= 360;
		unsigned short camResolution = isSequential ? 720 : 360;
		unsigned int scheduleTickPerDegree = CurrentDecoder->GetTickPerDegree();
		//unsigned short scheduleRpm = (360000000 / 60) / scheduleTickPerDegree;
		unsigned int scheduleTick = CurrentTimerService->GetTick();
		unsigned int ticksPerSecond = CurrentTimerService->GetTicksPerSecond();
						
		IgnitionTiming ignitionTiming =  _pistonEngineIgnitionConfig->GetIgnitionTiming();
				
		for (unsigned char cylinder = 1; cylinder <= _pistonEngineConfig->Cylinders; cylinder++)
		{
			unsigned int currentTickPlusSome = CurrentTimerService->GetTick() + 5;
#ifndef NOINJECTION
			if (isSequential)
			{
				if (currentTickPlusSome < _injectorOpenTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _injectorOpenTask[cylinder]->Tick < 1431655765))
				{
					InjectorTiming injectorTiming = _pistonEngineInjectionConfig->GetInjectorTiming(cylinder);
					if (injectorTiming.PulseWidth == 0)
					{
						CurrentTimerService->UnScheduleTask(_injectorOpenTask[cylinder]);
						CurrentTimerService->UnScheduleTask(_injectorCloseTask[cylinder]);
					}
					else
					{
						float injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						unsigned int injectorPulseWidthTick = injectorTiming.PulseWidth * ticksPerSecond;
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						float degreesUntilOpen = (((cylinder - 1) * 720) / _pistonEngineConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						unsigned int injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
						unsigned int injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						CurrentTimerService->ReScheduleTask(_injectorOpenTask[cylinder], injectorOpenTick);
						CurrentTimerService->ReScheduleTask(_injectorCloseTask[cylinder], injectorCloseTick);
					}
				}
			}
#endif
			
			if (currentTickPlusSome < _ignitorDwellTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _ignitorDwellTask[cylinder]->Tick < 1431655765))
			{
				if (!ignitionTiming.ignitionEnable)
				{
					CurrentTimerService->UnScheduleTask(_ignitorFireTask[cylinder]);
					CurrentTimerService->UnScheduleTask(_ignitorDwellTask[cylinder]);
				}
				else
				{
					float degreesUntilFire = (((cylinder - 1) * 720) / _pistonEngineConfig->Cylinders) - (ignitionTiming.IgnitionAdvance64thDegree * 0.015625f) - scheduleCamPosition;
					if (degreesUntilFire < 0)
						degreesUntilFire += camResolution;
					if (degreesUntilFire > camResolution)
						degreesUntilFire -= camResolution >> 2;
					if (degreesUntilFire < 0)
						degreesUntilFire += camResolution;
					unsigned int ignitionFireTick = scheduleTick + (scheduleTickPerDegree * degreesUntilFire);
					CurrentTimerService->ReScheduleTask(_ignitorFireTask[cylinder], ignitionFireTick);
				
					//if ignition is not dwelling yet set both tasks
					if(currentTickPlusSome < _ignitorDwellTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _ignitorDwellTask[cylinder]->Tick < 1431655765))
					{
						unsigned int ignitionDwellTick = ignitionFireTick - (ignitionTiming.IgnitionDwellTime * ticksPerSecond);
						CurrentTimerService->ReScheduleTask(_ignitorDwellTask[cylinder], ignitionDwellTick);
					}
				}
			}
			//a fast change in the ignition advance could cause insufficient dwell time
//			else if (currentTickPlusSome < _ignitorFireTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _ignitorFireTask[cylinder]->Tick < 1431655765))
//			{	
//				//if ignition is dwelling but enough time before ignition set fire task
//				float degreesUntilFire = (((cylinder - 1) * 720) / _pistonEngineConfig->Cylinders) - (ignitionTiming.IgnitionAdvance64thDegree * 0.015625f) - scheduleCamPosition;
//				if (degreesUntilFire < 0)
//					degreesUntilFire += camResolution;
//				if (degreesUntilFire > camResolution)
//					degreesUntilFire -= camResolution >> 2;
//				if (degreesUntilFire < 0)
//					degreesUntilFire += camResolution;
//				unsigned int ignitionFireTick = scheduleTick + (scheduleTickPerDegree * degreesUntilFire);
//				CurrentTimerService->ReScheduleTask(_ignitorFireTask[cylinder], ignitionFireTick);
//			}
		}
#ifndef NOINJECTION
		if (!isSequential)
		{
			if (_pistonEngineConfig->Cylinders % 2)
			{
				//even number of cylinders, run banks in dual cylinder mode
				unsigned char cylindersToGoTo = _pistonEngineConfig->Cylinders >> 2;
				for (unsigned char cylinder = 1; cylinder <= cylindersToGoTo; cylinder+=2)
				{
					unsigned int currentTickPlusSome = CurrentTimerService->GetTick() + 5;
					if (currentTickPlusSome < _injectorOpenTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _injectorOpenTask[cylinder]->Tick < 1431655765))
					{
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						InjectorTiming injectorTiming = _pistonEngineInjectionConfig->GetInjectorTiming(cylinder);
						float injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						unsigned int injectorPulseWidthTick = injectorTiming.PulseWidth * ticksPerSecond;
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						float degreesUntilOpen = (((cylinder - 1) * 720) / _pistonEngineConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						unsigned int injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
						unsigned int injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						CurrentTimerService->ReScheduleTask(_injectorOpenTask[cylinder], injectorOpenTick);
						CurrentTimerService->ReScheduleTask(_injectorCloseTask[cylinder], injectorCloseTick);
						
						injectorTiming = _pistonEngineInjectionConfig->GetInjectorTiming(cylinder + cylindersToGoTo);
						injectorStartPosition = (injectorTiming.OpenPosition64thDegree % (720 * 64)) / 64.0f;
						injectorPulseWidthTick = injectorTiming.PulseWidth * ticksPerSecond;
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						degreesUntilOpen = (((cylinder - 1) * 720) / _pistonEngineConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
						injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						CurrentTimerService->ReScheduleTask(_injectorOpenTask[cylinder + cylindersToGoTo], injectorOpenTick);
						CurrentTimerService->ReScheduleTask(_injectorCloseTask[cylinder + cylindersToGoTo], injectorCloseTick);
					}
				}
			}
		}
#endif
	}
}