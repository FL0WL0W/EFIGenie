#include "IOServices/FloatOutputService/FloatOutputService_StepperInterpolatedTable.h"
#include "Interpolation.h"

#ifdef FLOATOUTPUTSERVICE_STEPPERINTERPOLATEDTABLE_H
namespace IOServices
{
	FloatOutputService_StepperInterpolatedTable::FloatOutputService_StepperInterpolatedTable(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatOutputService_StepperInterpolatedTableConfig *config)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_config = config;

		_stepperService = IStepperOutputService::CreateStepperOutputService(_hardwareAbstractionCollection, ((void *)(_config + 1)), 0);
	}

	void FloatOutputService_StepperInterpolatedTable::SetOutput(float value)
	{
		int newStepPosition = Interpolation::InterpolateTable1<int>(value, _config->MaxValue, _config->MinValue, _config->Resolution, _config->Table);

		_stepperService->Step(newStepPosition - _currentStepPosition);

		_currentStepPosition = newStepPosition;
	}
}
#endif