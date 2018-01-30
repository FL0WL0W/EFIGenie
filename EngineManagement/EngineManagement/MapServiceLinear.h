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
		uint32_t _sampleRate;
		void LoadConfig(void *config);
	public:
		MapServiceLinear(HardwareAbstraction::ITimerService *_timerService, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config);
		void ReadMap();
		static void ReadMapTask(void *mapServiceLinear);
		float MapKpa;
		float MaxMapKpa;
	};
}