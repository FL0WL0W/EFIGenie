namespace EngineManagement
{
	class InjectorService : public IInjectorService
	{
	protected:
		unsigned char _injectorPin;
		HardwareAbstraction::IDigitalService *_digitalService;
		bool _normalOn;
		bool _highZ;
	public:
		InjectorService(HardwareAbstraction::IDigitalService *digitalService, unsigned char injectorPin, bool normalOn, bool highZ);
		void InjectorOpen();
		void InjectorClose();
	};
}