#include "IOServices/StepperOutputService/StepperOutputService_HalfStepControl.h"

#ifdef STEPPEROUTPUTSERVICE_HALFSTEPCONTROL_H
namespace IOServices
{
	void StepperOutputService_HalfStepControl::StepCallBack(void *stepperOutputService_HalfStepControl)
	{
		reinterpret_cast<StepperOutputService_HalfStepControl *>(stepperOutputService_HalfStepControl)->Step();
	}

	StepperOutputService_HalfStepControl::StepperOutputService_HalfStepControl(const HardwareAbstractionCollection *hardwareAbstractionCollection, const StepperOutputService_HalfStepControlConfig *config, IBooleanOutputService *coilAPlusBooleanOutputService, IBooleanOutputService *coilAMinusBooleanOutputService, IBooleanOutputService *coilBPlusBooleanOutputService, IBooleanOutputService *coilBMinusBooleanOutputService)
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

	void StepperOutputService_HalfStepControl::Step(int32_t steps)
	{
		if(_stepQueue == 0)
		{
			_stepQueue += steps;
			Step();
		}
		else
			_stepQueue += steps;
	}

	void StepperOutputService_HalfStepControl::Step()
	{
		if(_stepQueue == 0)
			return;

		if(_stepQueue > 0)
		{
			_state--;
			if(_state < 0)
				_state = 7;
			_stepQueue--;
		}
		else
		{
			_state++;
			_state %= 8;
			_stepQueue++;
		}

		const uint32_t ticksPerSecond = _hardwareAbstractionCollection->TimerService->GetTicksPerSecond();
		SetState(_state);
		const uint32_t tick = _hardwareAbstractionCollection->TimerService->GetTick();
		_hardwareAbstractionCollection->TimerService->ScheduleTask(_stepTask, tick + ticksPerSecond / _config->MaxStepsPerSecond);
	}
	
	void StepperOutputService_HalfStepControl::SetState(int8_t state)
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
				_coilAPlusBooleanOutputService->OutputSet();
				_coilBPlusBooleanOutputService->OutputSet();
				_coilAMinusBooleanOutputService->OutputReset();
				_coilBMinusBooleanOutputService->OutputReset();
				break;
			case 2:
				_coilAPlusBooleanOutputService->OutputReset();
				_coilBPlusBooleanOutputService->OutputSet();
				_coilAMinusBooleanOutputService->OutputReset();
				_coilBMinusBooleanOutputService->OutputReset();
				break;
			case 3:
				_coilAPlusBooleanOutputService->OutputReset();
				_coilBPlusBooleanOutputService->OutputSet();
				_coilAMinusBooleanOutputService->OutputSet();
				_coilBMinusBooleanOutputService->OutputReset();
				break;
			case 4:
				_coilAPlusBooleanOutputService->OutputReset();
				_coilBPlusBooleanOutputService->OutputReset();
				_coilAMinusBooleanOutputService->OutputSet();
				_coilBMinusBooleanOutputService->OutputReset();
				break;
			case 5:
				_coilAPlusBooleanOutputService->OutputReset();
				_coilBPlusBooleanOutputService->OutputReset();
				_coilAMinusBooleanOutputService->OutputSet();
				_coilBMinusBooleanOutputService->OutputSet();
				break;
			case 6:
				_coilAPlusBooleanOutputService->OutputReset();
				_coilBPlusBooleanOutputService->OutputReset();
				_coilAMinusBooleanOutputService->OutputReset();
				_coilBMinusBooleanOutputService->OutputSet();
				break;
			case 7:
				_coilAPlusBooleanOutputService->OutputSet();
				_coilBPlusBooleanOutputService->OutputReset();
				_coilAMinusBooleanOutputService->OutputReset();
				_coilBMinusBooleanOutputService->OutputSet();
				break;
		}
		_state = state;
	}
	
	void StepperOutputService_HalfStepControl::Calibrate()
	{
		//This is the base class that does no calibration. That will happen in the wrapper class
	}
}
#endif
