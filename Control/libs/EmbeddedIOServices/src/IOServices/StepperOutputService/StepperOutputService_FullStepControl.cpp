#include "IOServices/StepperOutputService/StepperOutputService_FullStepControl.h"

#ifdef STEPPEROUTPUTSERVICE_FULLSTEPCONTROL_H
namespace IOServices
{
	void StepperOutputService_FullStepControl::StepCallBack(void *stepperOutputService_FullStepControl)
	{
		reinterpret_cast<StepperOutputService_FullStepControl *>(stepperOutputService_FullStepControl)->Step();
	}

	StepperOutputService_FullStepControl::StepperOutputService_FullStepControl(const HardwareAbstractionCollection *hardwareAbstractionCollection, const StepperOutputService_FullStepControlConfig *config, IBooleanOutputService *coilAPlusBooleanOutputService, IBooleanOutputService *coilAMinusBooleanOutputService, IBooleanOutputService *coilBPlusBooleanOutputService, IBooleanOutputService *coilBMinusBooleanOutputService)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_config = config;
		_coilAPlusBooleanOutputService = coilAPlusBooleanOutputService;
		_coilAMinusBooleanOutputService = coilAMinusBooleanOutputService;
		_coilBPlusBooleanOutputService = coilBPlusBooleanOutputService;
		_coilBMinusBooleanOutputService = coilBMinusBooleanOutputService;
		
		_stepTask = new Task(StepCallBack, this, false);
		SetState(0);
	}

	void StepperOutputService_FullStepControl::Step(int32_t steps)
	{
		if(_stepQueue == 0)
		{
			_stepQueue += steps;
			Step();
		}
		else
			_stepQueue += steps;
	}

	void StepperOutputService_FullStepControl::Step()
	{
		if(_stepQueue == 0)
			return;

		if(_stepQueue > 0)
		{
			_state--;
			if(_state < 0)
				_state = 3;
			_stepQueue--;
		}
		else
		{
			_state++;
			_state %= 4;
			_stepQueue++;
		}

		const uint32_t ticksPerSecond = _hardwareAbstractionCollection->TimerService->GetTicksPerSecond();
		SetState(_state);
		const uint32_t tick = _hardwareAbstractionCollection->TimerService->GetTick();
		_hardwareAbstractionCollection->TimerService->ReScheduleTask(_stepTask, tick + ticksPerSecond / _config->MaxStepsPerSecond);
	}
	
	void StepperOutputService_FullStepControl::SetState(int8_t state)
	{
		switch(state)
		{
			case 0:
				_coilAPlusBooleanOutputService->OutputSet();
				_coilBPlusBooleanOutputService->OutputReset();
				_coilAMinusBooleanOutputService->OutputReset();
				_coilBMinusBooleanOutputService->OutputReset();
				break;
			case 1:
				_coilAPlusBooleanOutputService->OutputReset();
				_coilBPlusBooleanOutputService->OutputSet();
				_coilAMinusBooleanOutputService->OutputReset();
				_coilBMinusBooleanOutputService->OutputReset();
				break;
			case 2:
				_coilAPlusBooleanOutputService->OutputReset();
				_coilBPlusBooleanOutputService->OutputReset();
				_coilAMinusBooleanOutputService->OutputSet();
				_coilBMinusBooleanOutputService->OutputReset();
				break;
			case 3:
				_coilAPlusBooleanOutputService->OutputReset();
				_coilBPlusBooleanOutputService->OutputReset();
				_coilAMinusBooleanOutputService->OutputReset();
				_coilBMinusBooleanOutputService->OutputSet();
				break;
		}
		_state = state;
	}
	
	void StepperOutputService_FullStepControl::Calibrate()
	{
		//This is the base class that does no calibration. That will happen in the wrapper class
	}
}
#endif
