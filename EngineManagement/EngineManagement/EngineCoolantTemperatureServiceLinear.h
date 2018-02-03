namespace EngineManagement
{
	class EngineCoolantTemperatureServiceLinear : public IEngineCoolantTemperatureService
	{
		HardwareAbstraction::ITimerService *_timerService;
		HardwareAbstraction::IAnalogService *_analogService;
		uint8_t _adcPin;
		int _offset;
		int _slope;
		unsigned int _lastReadTick;
		void LoadConfig(void *config);
	public:
		EngineCoolantTemperatureServiceLinear(HardwareAbstraction::ITimerService *_timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config);
		void ReadEct();
		float EngineCoolantTemperature;
		float EngineCoolantTemperatureDerivative;
	};
}
