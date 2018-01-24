namespace EngineManagement
{
	class IgnitionService : public IIgnitionService
	{
	protected:
		uint8_t _ignitionPin;
		HardwareAbstraction::IDigitalService *_digitalService;
		bool _normalOn;
		bool _highZ;
	public:
		IgnitionService(HardwareAbstraction::IDigitalService *digitalService, uint8_t ignitionPin, bool normalOn, bool highZ);
		void CoilDwell();
		void CoilFire();
	};
}