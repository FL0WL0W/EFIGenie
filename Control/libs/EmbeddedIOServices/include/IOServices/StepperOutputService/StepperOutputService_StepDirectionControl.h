// #include "IOServices/StepperOutputService/IStepperOutputService.h"
// #include "Packed.h"
// #include "stdint.h"
// #include "math.h"

// #if !defined(STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H) && defined(ISTEPPEROUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
// #define STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H
// namespace IOServices
// {
// 	PACK(
// 	struct StepperOutputService_StepDirectionControlConfig
// 	{
// 	public:
// 		constexpr const unsigned int Size() const
// 		{
// 			return sizeof(StepperOutputService_StepDirectionControlConfig);
// 		}
		
// 		uint16_t MaxStepsPerSecond;
// 		float StepWidth;
// 	});

// 	class StepperOutputService_StepDirectionControl : public IStepperOutputService
// 	{
// 	protected:
// 		const HardwareAbstraction::HardwareAbstractionCollection *_hardwareAbstractionCollection;
// 		const StepperOutputService_StepDirectionControlConfig *_config;
// 		IBooleanOutputService *_stepBooleanOutputService;
// 		IBooleanOutputService *_directionBooleanOutputService;
// 		int32_t _stepQueue = 0;
// 		HardwareAbstraction::Task *_offTask;
// 		HardwareAbstraction::Task *_stepTask;
// 		void Step();

// 	public:
// 		StepperOutputService_StepDirectionControl(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const StepperOutputService_StepDirectionControlConfig *config, IBooleanOutputService *stepBooleanOutputService, IBooleanOutputService *directionBooleanOutputService);
// 		void Step(int32_t steps) override;
// 		void Calibrate() override;
// 	};
// }
// #endif
