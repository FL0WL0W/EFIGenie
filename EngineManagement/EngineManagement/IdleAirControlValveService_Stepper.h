#if defined(IIdleAirControlValveServiceExists) && defined(IStepperServiceExists)
#define IdleAirControlValveService_StepperExists
namespace EngineManagement
{
	class IdleAirControlValveService_Stepper : public IIdleAirControlValveService
	{
		IStepperService *_stepperService;
		int _currentStepPosition;
		int _minStepPosition;
		int _maxStepPosition;
		float A0, A1, A2, A3;
	public:
		IdleAirControlValveService_Stepper(void *config);
		void SetArea(float area);
	};
}
#endif