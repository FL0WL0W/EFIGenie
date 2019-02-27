#include "IOServices/StepperOutputService/IStepperOutputService.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "Packed.h"

#if !defined(STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H) && defined(ISTEPPEROUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H
namespace IOServices
{
	PACK(
	struct StepperOutputService_StepDirectionControlConfig
	{
	public:
		constexpr const unsigned int Size() const
		{
			return sizeof(StepperOutputService_StepDirectionControlConfig);
		}
		
		uint16_t MaxStepsPerSecond;
		float StepWidth;
	});

	class StepperOutputService_StepDirectionControl : public IStepperOutputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const StepperOutputService_StepDirectionControlConfig *_config;
		IBooleanOutputService *_stepBooleanOutputService;
		IBooleanOutputService *_directionBooleanOutputService;
		int32_t _stepQueue = 0;
		Task *_offTask;
		Task *_stepTask;
		static void StepCallBack(void *stepperOutputService_StepDirectionControl);
		void Step();

	public:
		StepperOutputService_StepDirectionControl(const HardwareAbstractionCollection *hardwareAbstractionCollection, const StepperOutputService_StepDirectionControlConfig *config, IBooleanOutputService *stepBooleanOutputService, IBooleanOutputService *directionBooleanOutputService);
		void Step(int32_t steps) override;
		void Calibrate() override;
	};
}
#endif
