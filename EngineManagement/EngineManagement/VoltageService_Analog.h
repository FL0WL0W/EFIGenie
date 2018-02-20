namespace EngineManagement
{
	class VoltageService_Analog : public IVoltageService
	{
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick = 0;
		float _lastVoltage = 0;
		unsigned short _dotSampleRate;
		void LoadConfig(void *config);
	public:
		VoltageService_Analog(void *config);
		void ReadVoltage();
	};
}
