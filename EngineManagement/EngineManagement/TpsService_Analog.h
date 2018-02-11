namespace EngineManagement
{
	class TpsService_Analog : public ITpsService
	{
	protected:
		HardwareAbstraction::ITimerService *_timerService;
		HardwareAbstraction::IAnalogService *_analogService;
		uint8_t _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		unsigned short _dotSampleRate;
		void LoadConfig(void *config);
	public:
		TpsService_Analog(HardwareAbstraction::ITimerService *_timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config);
		void ReadTps();
	};
}