#if defined(IIdleControlServiceExists)
#define IdleControlService_PdExists
namespace EngineManagement
{
	class IdleControlService_Pd : public IIdleControlService
	{
	protected:
		float _tpsThreshold;
		float _speedThreshold;
		float _kP;
		float _kD;
		
		float _maxEct;
		float _minEct;
		unsigned char _ectResolution;
		unsigned char _speedResolution;
		float *_idleAirmass;
		unsigned short *_idleTargetRpm;
		float *_idleAirmassSpeedAdder;
		short *_idleTargetRpmSpeedAdder;
		unsigned short _dotSampleRate;
		unsigned short _gasConstant;//values in 0.1 units

		unsigned int _lastReadTick = 0;
	public:
		IdleControlService_Pd(void *config);
		void Tick();
	};
}
#endif