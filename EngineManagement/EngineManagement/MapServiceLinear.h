namespace EngineManagement
{
	class MapServiceLinear : public IMapService
	{
	protected:
		MicroRtos::MicroRtos *_microRtos;
		HardwareAbstraction::IAnalogService *_analogService;
		MicroRtos::Task *_readMapTask;
		uint8_t _adcPin;
		int _offset;
		int _slope;
		uint32_t _sampleRate;
		void LoadConfig(void *config);
	public:
		MapServiceLinear(MicroRtos::MicroRtos *microRtos, HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config);
		void ReadMap();
		float MapKpa;
		float MaxMapKpa;
	};
}