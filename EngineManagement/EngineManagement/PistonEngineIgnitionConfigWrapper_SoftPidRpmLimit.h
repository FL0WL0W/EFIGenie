#if defined(IPistonEngineIgnitionConfigExists)
#define PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitExists
namespace EngineManagement
{
	class PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit : public IPistonEngineIgnitionConfig
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
		PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit(void *config);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif