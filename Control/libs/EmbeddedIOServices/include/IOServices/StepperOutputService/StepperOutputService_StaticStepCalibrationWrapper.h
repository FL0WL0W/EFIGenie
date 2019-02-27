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
	public:
		constexpr const uint32_t Size()
		{
			return sizeof(StepperOutputService_StaticStepCalibrationWrapperConfig);
		}
		
		int32_t StepsOnCalibration;
	});

	class StepperOutputService_StaticStepCalibrationWrapper : public IStepperOutputService
	{
	protected:
		const StepperOutputService_StaticStepCalibrationWrapperConfig *_config;
		IStepperOutputService *_child;

	public:
		StepperOutputService_StaticStepCalibrationWrapper(const StepperOutputService_StaticStepCalibrationWrapperConfig *config, IStepperOutputService *child);
		void Step(int32_t steps) override;
		void Calibrate() override;
	};
}
#endif
