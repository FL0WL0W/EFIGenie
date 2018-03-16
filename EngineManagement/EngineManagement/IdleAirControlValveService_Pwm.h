#ifdef IIdleAirControlValveServiceExists
#define IdleAirControlValveService_PwmExists
namespace EngineManagement
{
	class IdleAirControlValveService_Pwm : public IIdleAirControlValveService
	{
		unsigned char _pwmPin;
		float A0, A1, A2, A3;
		float _period;
	public:
		float MaxPwm;
		float MinPwm;
		IdleAirControlValveService_Pwm(void *config);
		void SetArea(float area);
	};
}
#endif