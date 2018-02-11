namespace EngineManagement
{
	class EthanolService_Pwm : public IEthanolService
	{
		HardwareAbstraction::IPwmService *_pwmService;
		unsigned char _pwmPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		void LoadConfig(void *config);
	public:
		EthanolService_Pwm(HardwareAbstraction::IPwmService *pwmService, unsigned char pwmPin, void *config);
		void ReadEthanolContent();
	};
}
