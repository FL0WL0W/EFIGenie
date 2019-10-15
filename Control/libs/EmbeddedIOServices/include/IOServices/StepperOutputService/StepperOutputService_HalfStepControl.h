// #include "IOServices/StepperOutputService/IStepperOutputService.h"
// #include "IOServices/BooleanOutputService/IBooleanOutputService.h"
// #include "Packed.h"
// #include "stdint.h"

// #if !defined(STEPPEROUTPUTSERVICE_HALFSTEPCONTROL_H) && defined(ISTEPPEROUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
// #define STEPPEROUTPUTSERVICE_HALFSTEPCONTROL_H
// namespace IOServices
// {
// 	PACK(
// 	struct StepperOutputService_HalfStepControlConfig
// 	{
// 	public:
// 		constexpr const unsigned int Size() const
// 		{
// 			return sizeof(StepperOutputService_HalfStepControlConfig);
// 		}
		
// 		uint16_t MaxStepsPerSecond;
// 		float StepWidth;
// 	});

// 	class StepperOutputService_HalfStepControl : public IStepperOutputService
// 	{
// 	protected:
// 		const HardwareAbstraction::HardwareAbstractionCollection *_hardwareAbstractionCollection;
// 		const StepperOutputService_HalfStepControlConfig *_config;
// 		IBooleanOutputService *_coilAPlusBooleanOutputService;
// 		IBooleanOutputService *_coilAMinusBooleanOutputService;
// 		IBooleanOutputService *_coilBPlusBooleanOutputService;
// 		IBooleanOutputService *_coilBMinusBooleanOutputService;
// 		int32_t _stepQueue = 0;
// 		int8_t _state;
// 		HardwareAbstraction::Task *_stepTask;
// 		void Step();
// 		void SetState(int8_t state);

// 	public:
// 		StepperOutputService_HalfStepControl(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const StepperOutputService_HalfStepControlConfig *config, IBooleanOutputService *coilAPlusBooleanOutputService, IBooleanOutputService *coilAMinusBooleanOutputService, IBooleanOutputService *coilBPlusBooleanOutputService, IBooleanOutputService *coilBMinusBooleanOutputService);
// 		void Step(int32_t steps) override;
// 		void Calibrate() override;
// 	};
// }
// #endif
