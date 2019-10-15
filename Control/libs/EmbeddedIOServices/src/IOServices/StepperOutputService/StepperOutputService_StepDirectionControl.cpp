// #include "IOServices/StepperOutputService/StepperOutputService_StepDirectionControl.h"

// using namespace HardwareAbstraction;

// #ifdef STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H
// namespace IOServices
// {
// 	StepperOutputService_StepDirectionControl::StepperOutputService_StepDirectionControl(const HardwareAbstractionCollection *hardwareAbstractionCollection, const StepperOutputService_StepDirectionControlConfig *config, IBooleanOutputService *stepBooleanOutputService, IBooleanOutputService *directionBooleanOutputService)
// 	{
// 		_hardwareAbstractionCollection = hardwareAbstractionCollection;
// 		_config = config;
// 		_stepBooleanOutputService = stepBooleanOutputService;
// 		_directionBooleanOutputService = directionBooleanOutputService;
		
// 		_offTask = new Task(new CallBack<IBooleanOutputService>(_stepBooleanOutputService, &IBooleanOutputService::OutputReset), false);
// 		_stepTask = new Task(new CallBack<StepperOutputService_StepDirectionControl>(this, &StepperOutputService_StepDirectionControl::Step), false);
// 	}

// 	void StepperOutputService_StepDirectionControl::Step(int32_t steps)
// 	{
// 		if(_stepQueue == 0)
// 		{
// 			_stepQueue += steps;
// 			Step();
// 		}
// 		else
// 			_stepQueue += steps;
// 	}

// 	void StepperOutputService_StepDirectionControl::Step()
// 	{
// 		if(_stepQueue == 0)
// 			return;

// 		if(_stepQueue > 0)
// 		{
// 			_directionBooleanOutputService->OutputSet();
// 			_stepQueue--;
// 		}
// 		else
// 		{
// 			_directionBooleanOutputService->OutputReset();
// 			_stepQueue++;
// 		}

// 		const uint32_t ticksPerSecond = _hardwareAbstractionCollection->TimerService->GetTicksPerSecond();
// 		const uint32_t tick = _hardwareAbstractionCollection->TimerService->GetTick();
// 		_stepBooleanOutputService->OutputSet();
// 		_hardwareAbstractionCollection->TimerService->ScheduleTask(_offTask, (uint32_t)round(tick + ticksPerSecond * _config->StepWidth));
// 		_hardwareAbstractionCollection->TimerService->ScheduleTask(_stepTask, tick + ticksPerSecond / _config->MaxStepsPerSecond);
// 	}
	
// 	void StepperOutputService_StepDirectionControl::Calibrate()
// 	{
// 		//This is the base class that does no calibration. That will happen in the wrapper class
// 	}
// }
// #endif
