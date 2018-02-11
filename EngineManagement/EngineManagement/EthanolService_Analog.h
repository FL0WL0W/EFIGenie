namespace EngineManagement
{
	class EthanolService_Analog : public IEthanolService
	{
		HardwareAbstraction::IAnalogService *_analogService;
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		void LoadConfig(void *config);
	public:
		EthanolService_Analog(HardwareAbstraction::IAnalogService *analogService, unsigned char adcPin, void *config);
		void ReadEthanolContent();
	};
}
