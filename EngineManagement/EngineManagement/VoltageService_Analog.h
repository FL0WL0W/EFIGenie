namespace EngineManagement
{
	class VoltageService_Analog : public IVoltageService
	{
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		unsigned short _dotSampleRate;
		void LoadConfig(void *config);
	public:
		VoltageService_Analog(unsigned char adcPin, void *config);
		void ReadVoltage();
	};
}
