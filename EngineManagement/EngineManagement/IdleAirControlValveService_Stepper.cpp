#include "Services.h"
#include "IdleAirControlValveService_Stepper.h"

#ifdef IdleAirControlValveService_StepperExists
namespace EngineManagement
{
	IdleAirControlValveService_Stepper::IdleAirControlValveService_Stepper(void *config)
	{
		A0 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A1 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A2 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A3 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		_maxStepPosition = *((int *)config);
		config = (void*)((float *)config + 1);
		
		_minStepPosition = *((int *)config);
		config = (void*)((float *)config + 1);
		
		_stepperService = CreateStepperService(config);
	}
	
	void IdleAirControlValveService_Stepper::SetArea(float area)
	{
		int newStepPosition = area * area * area * A3 + area * area * A2 + area * A1 + A0;
		
		if (newStepPosition > _maxStepPosition)
			newStepPosition = _maxStepPosition;
		else if (newStepPosition < _minStepPosition)
			newStepPosition = _minStepPosition;
		
		_stepperService->Step(newStepPosition - _currentStepPosition);
		
		_currentStepPosition = newStepPosition;
	}
}
#endif