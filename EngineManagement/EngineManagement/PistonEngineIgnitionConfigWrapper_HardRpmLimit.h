namespace EngineManagement
{
	class PistonEngineIgnitionConfigWrapper_HardRpmLimit : public IPistonEngineIgnitionConfig
	{
	protected:
		IPistonEngineIgnitionConfig *_child;
		bool _limitEnabled;
		unsigned char _pinEnable;
		bool _pinNormalOn;
		unsigned short _rpmEnable;
		unsigned short _rpmDisable;
	public:
		PistonEngineIgnitionConfigWrapper_HardRpmLimit(void *config);
		IgnitionTiming GetIgnitionTiming();
	};
}