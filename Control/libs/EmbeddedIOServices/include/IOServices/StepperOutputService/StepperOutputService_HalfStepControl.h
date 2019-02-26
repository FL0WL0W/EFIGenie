#include "IOServices/StepperOutputService/IStepperOutputService.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "Packed.h"

#if !defined(STEPPEROUTPUTSERVICE_HALFSTEPCONTROL_H) && defined(ISTEPPEROUTPUTSERVICE_H)
#define STEPPEROUTPUTSERVICE_HALFSTEPCONTROL_H

namespace IOServices
{
	PACK(
	struct StepperOutputService_HalfStepControlConfig
	{
	private:
		StepperOutputService_HalfStepControlConfig()
		{
			
		}
		
	public:
		unsigned int Size() const
		{
			return sizeof(StepperOutputService_HalfStepControlConfig);
		}
		
		unsigned short MaxStepsPerSecond;
		float StepWidth;
	});

	class StepperOutputService_HalfStepControl : public IStepperOutputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const StepperOutputService_HalfStepControlConfig *_config;
		IBooleanOutputService *_coilAPlusBooleanOutputService;
		IBooleanOutputService *_coilAMinusBooleanOutputService;
		IBooleanOutputService *_coilBPlusBooleanOutputService;
		IBooleanOutputService *_coilBMinusBooleanOutputService;
		int _stepQueue = 0;
		unsigned char _state;
		Task *_stepTask;
		static void StepCallBack(void *stepperOutputService_StepDirectionControl);
		void Step();
		void SetState(unsigned char state);

	public:
		StepperOutputService_HalfStepControl(const HardwareAbstractionCollection *hardwareAbstractionCollection, const StepperOutputService_HalfStepControlConfig *config, IBooleanOutputService *coilAPlusBooleanOutputService, IBooleanOutputService *coilAMinusBooleanOutputService, IBooleanOutputService *coilBPlusBooleanOutputService, IBooleanOutputService *coilBMinusBooleanOutputService);
		void Step(int steps);
		void Calibrate();
	};
}

#endif