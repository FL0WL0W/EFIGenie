namespace EngineManagement
{
	class InjectorService : public IInjectorService
	{
	protected:
		uint8_t _injectorPin;
		HardwareAbstraction::IDigitalService *_digitalService;
		bool _normalOn;
		bool _highZ;
	public:
		InjectorService(HardwareAbstraction::IDigitalService *digitalService, uint8_t injectorPin, bool normalOn, bool highZ);
		void InjectorOpen();
		void InjectorClose();
	};
}