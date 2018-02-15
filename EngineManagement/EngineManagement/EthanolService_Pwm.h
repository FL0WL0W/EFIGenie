namespace EngineManagement
{
	class EthanolService_Pwm : public IEthanolService
	{
		unsigned char _pwmPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
	public:
		EthanolService_Pwm(void *config);
		void ReadEthanolContent();
	};
}
