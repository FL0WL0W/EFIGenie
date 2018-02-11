namespace EngineManagement
{
	class MapService_Analog : public IMapService
	{
	protected:
		HardwareAbstraction::ITimerService *_timerService;
		HardwareAbstraction::IAnalogService *_analogService;
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		unsigned short _dotSampleRate;
		void LoadConfig(void *config);
	public:
		MapService_Analog(HardwareAbstraction::ITimerService *_timerService, HardwareAbstraction::IAnalogService *analogService, unsigned char adcPin, void *config);
		void ReadMap();
	};
}