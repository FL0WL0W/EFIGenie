#ifdef IIdleAirControlValveServiceExists
#define IdleAirControlValveService_PwmExists
namespace EngineManagement
{
	struct __attribute__((__packed__)) IdleAirControlValveService_PwmConfig
	{
	private:
		IdleAirControlValveService_PwmConfig()
		{
			
		}
	public:
		static IdleAirControlValveService_PwmConfig* Cast(void *p)
		{
			return (IdleAirControlValveService_PwmConfig *)p;
		}
		unsigned char PwmPin;
		float A0, A1, A2, A3;
		float MinPulseWidth;
		float MaxPulseWidth;
		unsigned short Frequency;
	};
	
	class IdleAirControlValveService_Pwm : public IIdleAirControlValveService
	{
		const IdleAirControlValveService_PwmConfig *_config;
		float _period;
	public:
		IdleAirControlValveService_Pwm(const IdleAirControlValveService_PwmConfig *config);
		void SetArea(float area);
	};
}
#endif