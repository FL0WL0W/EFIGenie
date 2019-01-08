#include "IOServices/StepperOutputService/StepperOutputService_StaticStepCalibrationWrapper.h"

#ifdef STEPPEROUTPUTSERVICE_STATICSTEPCALIBRATIONWRAPER_H
namespace IOServices
{
	StepperOutputService_StaticStepCalibrationWrapper::StepperOutputService_StaticStepCalibrationWrapper(const StepperOutputService_StaticStepCalibrationWrapperConfig *config, IStepperOutputService *child)
	{
		_config = config;
		_child = child;
	}

	void StepperOutputService_StaticStepCalibrationWrapper::Step(int steps)
	{
		_child->Step(steps);
	}
	
	void StepperOutputService_StaticStepCalibrationWrapper::Calibrate()
	{
		Step(_config->StepsOnCalibration);
	}
}
#endif