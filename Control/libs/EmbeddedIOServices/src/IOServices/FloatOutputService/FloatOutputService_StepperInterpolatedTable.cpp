#include "IOServices/FloatOutputService/FloatOutputService_StepperInterpolatedTable.h"
#include "Interpolation.h"

using namespace HardwareAbstraction;

#ifdef FLOATOUTPUTSERVICE_STEPPERINTERPOLATEDTABLE_H
namespace IOServices
{
	FloatOutputService_StepperInterpolatedTable::FloatOutputService_StepperInterpolatedTable(const FloatOutputService_StepperInterpolatedTableConfig *config, IStepperOutputService *stepperService)
	{
		_config = config;
		_stepperService = stepperService;
		_currentStepPosition = 0;
	}

	void FloatOutputService_StepperInterpolatedTable::SetOutput(float value)
	{
		const int32_t newStepPosition = Interpolation::InterpolateTable1<const int32_t>(value, _config->MaxValue, _config->MinValue, _config->Resolution, _config->Table());

		_stepperService->Step(newStepPosition - _currentStepPosition);

		_currentStepPosition = newStepPosition;
	}

	void FloatOutputService_StepperInterpolatedTable::Calibrate() 
	{ 
		_stepperService->Calibrate();
	}
}
#endif
