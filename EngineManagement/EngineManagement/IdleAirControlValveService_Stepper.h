#if defined(IIdleAirControlValveServiceExists) && defined(IStepperServiceExists)
#define IdleAirControlValveService_StepperExists
namespace EngineManagement
{
	struct __attribute__((__packed__)) IdleAirControlValveService_StepperConfig
	{
	private:
		IdleAirControlValveService_StepperConfig()
		{
			
		}
	public:
		static IdleAirControlValveService_StepperConfig* Cast(void *p)
		{
			return (IdleAirControlValveService_StepperConfig *)p;
		}
		unsigned char StepperPin;
		float A0, A1, A2, A3;
		float MinStepPosition;
		float MaxStepPosition;
	};
	
	class IdleAirControlValveService_Stepper : public IIdleAirControlValveService
	{
		const IdleAirControlValveService_StepperConfig *_config;
		IStepperService *_stepperService;
		int _currentStepPosition;
	public:
		IdleAirControlValveService_Stepper(const IdleAirControlValveService_StepperConfig *config);
		void SetArea(float area);
	};
}
#endif