namespace EngineManagement
{
	class EthanolService_Analog : public IEthanolService
	{
		HardwareAbstraction::IAnalogService *_analogService;
		uint8_t _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		void LoadConfig(void *config);
	public:
		EthanolService_Analog(HardwareAbstraction::IAnalogService *analogService, uint8_t adcPin, void *config);
		void ReadEthanolContent();
	};
}
