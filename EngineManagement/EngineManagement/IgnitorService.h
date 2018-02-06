namespace EngineManagement
{
	class IgnitorService : public IIgnitorService
	{
	protected:
		uint8_t _ignitionPin;
		HardwareAbstraction::IDigitalService *_digitalService;
		bool _normalOn;
		bool _highZ;
	public:
		IgnitorService(HardwareAbstraction::IDigitalService *digitalService, unsigned char ignitionPin, bool normalOn, bool highZ);
		void CoilDwell();
		void CoilFire();
	};
}