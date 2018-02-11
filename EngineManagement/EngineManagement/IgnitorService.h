namespace EngineManagement
{
	class IgnitorService : public IIgnitorService
	{
	protected:
		unsigned char _ignitionPin;
		bool _normalOn;
		bool _highZ;
	public:
		IgnitorService(unsigned char ignitionPin, bool normalOn, bool highZ);
		void CoilDwell();
		void CoilFire();
	};
}