namespace EngineManagement
{
	class MapServiceLinear : public IMapService
	{
	protected:
		HardwareAbstraction::ITimerService *_timerService;
		HardwareAbstraction::IAnalogService *_analogService;
		HardwareAbstraction::Task *_readMapTask;
		uint8_t _adcPin;
		int _offset;
		int _slope;
		unsigned int _lastReadTick;
		void LoadConfig(void *config);
	public:
		MapServiceLinear(HardwareAbstraction::ITimerService *_timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config);
		void ReadMap();
		float MapKpa;
		float MaxMapKpa;
	};
}