#include "Services.h"
#include "IdleAirControlValveService_Stepper.h"

#ifdef IdleAirControlValveService_StepperExists
namespace EngineManagement
{
	IdleAirControlValveService_Stepper::IdleAirControlValveService_Stepper(const IdleAirControlValveService_StepperConfig *config)
	{
		_config = config;
		
		_stepperService = CreateStepperService((void*)(config + 1));
	}
	
	void IdleAirControlValveService_Stepper::SetArea(float area)
	{
		int newStepPosition = area * area * area * _config->A3 + area * area * _config->A2 + area * _config->A1 + _config->A0;
		
		if (newStepPosition > _config->MaxStepPosition)
			newStepPosition = _config->MaxStepPosition;
		else if (newStepPosition < _config->MinStepPosition)
			newStepPosition = _config->MinStepPosition;
		
		_stepperService->Step(newStepPosition - _currentStepPosition);
		
		_currentStepPosition = newStepPosition;
	}
}
#endif