namespace EngineManagement
{
	class TpsService_Analog : public ITpsService
	{
	protected:
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick = 0;
		float _lastTps = 0;
		unsigned short _dotSampleRate;
	public:
		TpsService_Analog(void *config);
		void ReadTps();
	};
}