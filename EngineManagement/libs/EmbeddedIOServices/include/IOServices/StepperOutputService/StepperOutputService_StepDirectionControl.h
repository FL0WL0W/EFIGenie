#include "IOServices/StepperOutputService/IStepperOutputService.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "Packed.h"

#if !defined(STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H) && defined(ISTEPPEROUTPUTSERVICE_H)
#define STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H

namespace IOServices
{
	PACK(
	struct StepperOutputService_StepDirectionControlConfig
	{
	private:
		StepperOutputService_StepDirectionControlConfig()
		{
			
		}
		
	public:
		static StepperOutputService_StepDirectionControlConfig* Cast(void *p)
		{
			return (StepperOutputService_StepDirectionControlConfig *)p;
		}
			
		unsigned int Size()
		{
			return sizeof(StepperOutputService_StepDirectionControlConfig);
		}
		
		unsigned int MaxStepsPerSecond;
		unsigned float StepWidth;
	});

	class StepperOutputService_StepDirectionControl : public IStepperOutputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const StepperOutputService_StepDirectionControlConfig *_config;
		IBooleanOutputService *_stepBooleanOutputService;
		IBooleanOutputService *_directionBooleanOutputService;
		int _stepQueue = 0;
		Task *_offTask;
		Task *_stepTask;
		static void StepCallBack(void *stepperOutputService_StepDirectionControl);
		void Step();

	public:
		StepperOutputService_StepDirectionControl(const HardwareAbstractionCollection *hardwareAbstractionCollection, const StepperOutputService_StepDirectionControlConfig *config, IBooleanOutputService *stepBooleanOutputService, IBooleanOutputService *directionBooleanOutputService);
		void Step(int steps);
		void Calibrate();
	};
}

#endif