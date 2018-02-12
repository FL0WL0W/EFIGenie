namespace EngineManagement
{
	class PistonEngineIgnitionConfigWrapper_SoftRpmLimit : public IPistonEngineIgnitionConfig
	{
	protected:
		IPistonEngineIgnitionConfig *_child;
		unsigned char _pinEnable;
		bool _pinNormalOn;
		unsigned short _prevError;
		unsigned int _prevRpmTime;
		unsigned short _rpmStart;
		unsigned short _rpmLimit;
		float _integral;
		float _rpmKp;
		float _rpmKi;
		float _rpmKd;
	public:
		PistonEngineIgnitionConfigWrapper_SoftRpmLimit(void *config);
		IgnitionTiming GetIgnitionTiming();
	};
}