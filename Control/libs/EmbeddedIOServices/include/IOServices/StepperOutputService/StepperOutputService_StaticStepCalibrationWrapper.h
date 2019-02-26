#include "IOServices/StepperOutputService/IStepperOutputService.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "Packed.h"

#if !defined(STEPPEROUTPUTSERVICE_STATICSTEPCALIBRATIONWRAPER_H) && defined(ISTEPPEROUTPUTSERVICE_H)
#define STEPPEROUTPUTSERVICE_STATICSTEPCALIBRATIONWRAPER_H

namespace IOServices
{
	PACK(
	struct StepperOutputService_StaticStepCalibrationWrapperConfig
	{
	private:
		StepperOutputService_StaticStepCalibrationWrapperConfig()
		{
			
		}
		
	public:
		unsigned int Size()
		{
			return sizeof(StepperOutputService_StaticStepCalibrationWrapperConfig);
		}
		
		int StepsOnCalibration;
	});

	class StepperOutputService_StaticStepCalibrationWrapper : public IStepperOutputService
	{
	protected:
		const StepperOutputService_StaticStepCalibrationWrapperConfig *_config;
		IStepperOutputService *_child;

	public:
		StepperOutputService_StaticStepCalibrationWrapper(const StepperOutputService_StaticStepCalibrationWrapperConfig *config, IStepperOutputService *child);
		void Step(int steps);
		void Calibrate();
	};
}

#endif