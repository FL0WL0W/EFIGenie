#include <map>
#include <functional>
#include "ITimerService.h"
#include "MicroRtos.h"
#include "IIgnitionService.h"
#include "IInjectorService.h"
#include "IMapService.h"
#include "IDecoder.h"
#include "IPistonEngineConfig.h"
#include "PistonEngineController.h"

#define INJECTOR_TASK_PRIORITY 1 //needs to be accurate but not as accurate as spark
#define IGNITION_FIRE_TASK_PRIORITY 0 // needs to be accurate
#define IGNITION_DWELL_TASK_PRIORITY 2 // needs to be close

namespace EngineManagement
{
	PistonEngineController::PistonEngineController(MicroRtos::MicroRtos *microRtos, Decoder::IDecoder *decoder, IIgnitionService *ignitionServices[MAX_CYLINDERS], IInjectorService *injectorServices[MAX_CYLINDERS], IPistonEngineConfig *pistonEngineConfig)
	{
		_microRtos = microRtos;
		_decoder = decoder;
		_pistonEngineConfig = pistonEngineConfig;
		for (uint8_t cylinder = 1; cylinder <= _pistonEngineConfig->Cylinders; cylinder++)
		{
			_ignitionServices[cylinder] = ignitionServices[cylinder];
			_injectorServices[cylinder] = injectorServices[cylinder];
			_injectorOpenTask[cylinder] = new MicroRtos::Task(std::bind(&IInjectorService::InjectorOpen, _injectorServices[cylinder]), INJECTOR_TASK_PRIORITY, false);
			_injectorCloseTask[cylinder] = new MicroRtos::Task(std::bind(&IInjectorService::InjectorClose, _injectorServices[cylinder]), INJECTOR_TASK_PRIORITY, false);
			_ignitionDwellTask[cylinder] = new MicroRtos::Task(std::bind(&IIgnitionService::CoilDwell, _ignitionServices[cylinder]), IGNITION_DWELL_TASK_PRIORITY, false);
			_ignitionFireTask[cylinder] = new MicroRtos::Task(std::bind(&IIgnitionService::CoilFire, _ignitionServices[cylinder]), IGNITION_FIRE_TASK_PRIORITY, false);
		}
	}
	
	void PistonEngineController::ScheduleEvents(void)
	{
		bool isSequential = _decoder->HasCamPosition();
		float scheduleCamPosition = _decoder->GetCamPosition();
		if (isSequential && scheduleCamPosition > 360)
			scheduleCamPosition -= 360;
		uint16_t camResolution = isSequential ? 720 : 360;
		unsigned int scheduleTickPerDegree = _decoder->GetTickPerDegree();
		//uint16_t scheduleRpm = (360000000 / 60) / scheduleTickPerDegree;
		unsigned int scheduleTick = _microRtos->GetTick();
						
		unsigned int ignitionDwellTime10Us =  _pistonEngineConfig->GetIgnitionDwellTime10Us();
		int16_t ignitionAdvance64thDegree = _pistonEngineConfig->GetIgnitionAdvance64thDegree();
				
		for (uint8_t cylinder = 1; cylinder <= _pistonEngineConfig->Cylinders; cylinder++)
		{
			unsigned int currentTickPlusSome = _microRtos->GetTick() + 5;
			if (isSequential)
			{
				if (_injectorOpenTask[cylinder]->Status != MicroRtos::TaskStatus::Running && (_injectorOpenTask[cylinder]->Status == _injectorCloseTask[cylinder]->Status || _injectorCloseTask[cylinder]->Status == MicroRtos::TaskStatus::Off) && (currentTickPlusSome < _injectorOpenTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _injectorOpenTask[cylinder]->Tick < 1431655765)))
				{
					InjectorTiming injectorTiming = _pistonEngineConfig->GetInjectorTiming(cylinder);
					uint16_t injectorStartPosition = injectorTiming.OpenPosition % 720;
					unsigned int injectorPulseWidthTick = injectorTiming.PulseWidth * _microRtos->GetTicksPerSecond();
					
					//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
					float degreesUntilOpen = (((cylinder - 1) * 720) / _pistonEngineConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
					if (degreesUntilOpen > 720)
						degreesUntilOpen -= 1440;
					if (degreesUntilOpen < 0)
						degreesUntilOpen += 720;
					unsigned int injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
					unsigned int injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
					_microRtos->ReScheduleTask(_injectorOpenTask[cylinder], injectorOpenTick);
					_microRtos->ReScheduleTask(_injectorCloseTask[cylinder], injectorCloseTick);
				}
			}
			
			if (_ignitionDwellTask[cylinder]->Status != MicroRtos::TaskStatus::Running && (_ignitionDwellTask[cylinder]->Status == _ignitionFireTask[cylinder]->Status || _ignitionFireTask[cylinder]->Status == MicroRtos::TaskStatus::Off))
			{
				float degreesUntilFire = (((cylinder - 1) * 720) / _pistonEngineConfig->Cylinders) - (ignitionAdvance64thDegree * 0.015625f) - scheduleCamPosition;
				if (degreesUntilFire < 0)
					degreesUntilFire += camResolution;
				if (degreesUntilFire > camResolution)
					degreesUntilFire -= camResolution >> 2;
				if (degreesUntilFire < 0)
					degreesUntilFire += camResolution;
				unsigned int ignitionFireTick = scheduleTick + (scheduleTickPerDegree * degreesUntilFire);
				_microRtos->ReScheduleTask(_ignitionFireTask[cylinder], ignitionFireTick);
				
				//if ignition is not dwelling yet set both tasks
				if (currentTickPlusSome < _ignitionDwellTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _ignitionDwellTask[cylinder]->Tick < 1431655765))
				{
					unsigned int ignitionDwellTick = ignitionFireTick - ignitionDwellTime10Us;
					_microRtos->ReScheduleTask(_ignitionDwellTask[cylinder], ignitionDwellTick);
				}
			}
			else if (_ignitionDwellTask[cylinder]->Status == MicroRtos::TaskStatus::Off && _ignitionFireTask[cylinder]->Status == MicroRtos::TaskStatus::Pending && (currentTickPlusSome < _ignitionFireTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _ignitionFireTask[cylinder]->Tick < 1431655765)))
			{	
				//if ignition is dwelling but enough time before ignition set fire task
				float degreesUntilFire = (((cylinder - 1) * 720) / _pistonEngineConfig->Cylinders) - (ignitionAdvance64thDegree * 0.015625f) - scheduleCamPosition;
				if (degreesUntilFire < 0)
					degreesUntilFire += camResolution;
				if (degreesUntilFire > camResolution)
					degreesUntilFire -= camResolution >> 2;
				if (degreesUntilFire < 0)
					degreesUntilFire += camResolution;
				unsigned int ignitionFireTick = scheduleTick + (scheduleTickPerDegree * degreesUntilFire);
				_microRtos->ReScheduleTask(_ignitionFireTask[cylinder], ignitionFireTick);
			}
		}
		if (!isSequential)
		{
			if (_pistonEngineConfig->Cylinders % 2)
			{
				//even number of cylinders, run banks in dual cylinder mode
				uint8_t cylindersToGoTo = _pistonEngineConfig->Cylinders >> 2;
				for (uint8_t cylinder = 1; cylinder <= cylindersToGoTo; cylinder+=2)
				{
					unsigned int currentTickPlusSome = _microRtos->GetTick() + 5;
					if (_injectorOpenTask[cylinder]->Status != MicroRtos::TaskStatus::Running && (_injectorOpenTask[cylinder]->Status == _injectorCloseTask[cylinder]->Status || _injectorCloseTask[cylinder]->Status == MicroRtos::TaskStatus::Off) && (currentTickPlusSome < _injectorOpenTask[cylinder]->Tick || (currentTickPlusSome >= 2863311531 && _injectorOpenTask[cylinder]->Tick < 1431655765)))
					{
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						InjectorTiming injectorTiming = _pistonEngineConfig->GetInjectorTiming(cylinder);
						uint16_t injectorStartPosition = injectorTiming.OpenPosition % 720;
						unsigned int injectorPulseWidthTick = injectorTiming.PulseWidth * _microRtos->GetTicksPerSecond();
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						float degreesUntilOpen = (((cylinder - 1) * 720) / _pistonEngineConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						unsigned int injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
						unsigned int injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						_microRtos->ReScheduleTask(_injectorOpenTask[cylinder], injectorOpenTick);
						_microRtos->ReScheduleTask(_injectorCloseTask[cylinder], injectorCloseTick);
						
						injectorTiming = _pistonEngineConfig->GetInjectorTiming(cylinder + cylindersToGoTo);
						injectorStartPosition = injectorTiming.OpenPosition % 720;
						injectorPulseWidthTick = injectorTiming.PulseWidth * _microRtos->GetTicksPerSecond();
					
						//if injector has not opened yet and will not be opening for sufficient time then schedule its opening time
						degreesUntilOpen = (((cylinder - 1) * 720) / _pistonEngineConfig->Cylinders) + injectorStartPosition - scheduleCamPosition;
						if (degreesUntilOpen > 720)
							degreesUntilOpen -= 1440;
						if (degreesUntilOpen < 0)
							degreesUntilOpen += 720;
						injectorOpenTick = scheduleTick + (scheduleTickPerDegree * degreesUntilOpen);
						injectorCloseTick = injectorOpenTick + injectorPulseWidthTick;
						_microRtos->ReScheduleTask(_injectorOpenTask[cylinder + cylindersToGoTo], injectorOpenTick);
						_microRtos->ReScheduleTask(_injectorCloseTask[cylinder + cylindersToGoTo], injectorCloseTick);
					}
				}
			}
		}
	}
}