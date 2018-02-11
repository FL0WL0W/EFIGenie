namespace EngineManagement
{
	class EngineCoolantTemperatureService_Analog : public IEngineCoolantTemperatureService
	{
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		unsigned short _dotSampleRate;
	public:
		EngineCoolantTemperatureService_Analog(unsigned char adcPin, void *config);
		void ReadEct();
	};
}
