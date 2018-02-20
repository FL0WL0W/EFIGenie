namespace EngineManagement
{
	class IntakeAirTemperatureService_Analog : public IIntakeAirTemperatureService
	{
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		float _lastIat;
		unsigned short _dotSampleRate;
	public:
		IntakeAirTemperatureService_Analog(void *config);
		void ReadIat();
	};
}
