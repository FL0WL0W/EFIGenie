namespace EngineManagement
{
	class EngineCoolantTemperatureService : public IEngineCoolantTemperatureService
	{
		HardwareAbstraction::ITimerService *_timerService;
		HardwareAbstraction::IAnalogService *_analogService;
		uint8_t _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		void LoadConfig(void *config);
	public:
		EngineCoolantTemperatureService(HardwareAbstraction::ITimerService *_timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config);
		void ReadEct();
	};
}
