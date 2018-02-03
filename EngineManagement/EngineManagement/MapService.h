namespace EngineManagement
{
	class MapService : public IMapService
	{
	protected:
		HardwareAbstraction::ITimerService *_timerService;
		HardwareAbstraction::IAnalogService *_analogService;
		uint8_t _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		void LoadConfig(void *config);
	public:
		MapService(HardwareAbstraction::ITimerService *_timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config);
		void ReadMap();
		float MapKpa;
		float MaxMapKpa;
	};
}