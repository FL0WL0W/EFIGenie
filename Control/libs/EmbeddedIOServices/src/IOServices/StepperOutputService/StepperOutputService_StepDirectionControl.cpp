#include "IOServices/StepperOutputService/StepperOutputService_StepDirectionControl.h"

#ifdef STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H
namespace IOServices
{
	void StepperOutputService_StepDirectionControl::StepCallBack(void *stepperOutputService_StepDirectionControl)
	{
		reinterpret_cast<StepperOutputService_StepDirectionControl *>(stepperOutputService_StepDirectionControl)->Step();
	}

	StepperOutputService_StepDirectionControl::StepperOutputService_StepDirectionControl(const HardwareAbstractionCollection *hardwareAbstractionCollection, const StepperOutputService_StepDirectionControlConfig *config, IBooleanOutputService *stepBooleanOutputService, IBooleanOutputService *directionBooleanOutputService)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_config = config;
		_stepBooleanOutputService = stepBooleanOutputService;
		_directionBooleanOutputService = directionBooleanOutputService;
		
		_offTask = new Task(IBooleanOutputService::OutputResetCallBack, _stepBooleanOutputService, false);
		_stepTask = new Task(StepCallBack, this, false);
	}

	void StepperOutputService_StepDirectionControl::Step(int steps)
	{
		if(_stepQueue == 0)
		{
			_stepQueue += steps;
			Step();
		}
		else
			_stepQueue += steps;
	}

	void StepperOutputService_StepDirectionControl::Step()
	{
		if(_stepQueue == 0)
			return;

		if(_stepQueue > 0)
		{
			_directionBooleanOutputService->OutputSet();
			_stepQueue--;
		}
		else
		{
			_directionBooleanOutputService->OutputReset();
			_stepQueue++;
		}

		const unsigned int ticksPerSecond = _hardwareAbstractionCollection->TimerService->GetTicksPerSecond();
		const unsigned int tick = _hardwareAbstractionCollection->TimerService->GetTick();
		_stepBooleanOutputService->OutputSet();
		_hardwareAbstractionCollection->TimerService->ReScheduleTask(_offTask, (unsigned int)round(tick + ticksPerSecond * _config->StepWidth));
		_hardwareAbstractionCollection->TimerService->ReScheduleTask(_stepTask, tick + ticksPerSecond / _config->MaxStepsPerSecond);
	}
	
	void StepperOutputService_StepDirectionControl::Calibrate()
	{
		//This is the base class that does no calibration. That will happen in the wrapper class
	}
}
#endif
