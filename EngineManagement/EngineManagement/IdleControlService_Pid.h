#include "IIdleControlService.h"

#if !defined(IDLECONTROLSERVICE_PID_H) && defined(IIDLECONTROLSERVICE_H)
#define IDLECONTROLSERVICE_PID_H
namespace EngineManagement
{
	struct __attribute__((__packed__)) IdleControlService_PidConfig
	{
	private:
		IdleControlService_PidConfig()
		{

		}
	public:
		static IdleControlService_PidConfig* Cast(void *p)
		{
			IdleControlService_PidConfig *ret = (IdleControlService_PidConfig *)p;

			ret->IdleAirmass = (float *)(ret + 1);
			ret->IdleTargetRpm = (unsigned short *)(ret->IdleAirmass + ret->EctResolution);
			ret->IdleAirmassSpeedAdder = (float *)(ret->IdleTargetRpm + ret->SpeedResolution);
			ret->IdleTargetRpmSpeedAdder = (short *)(ret->IdleAirmassSpeedAdder + ret->SpeedResolution);
			return ret;
		}
		float TpsThreshold;
		float SpeedThreshold;
		float P;
		float I;
		float D;
		float MaxIntegral;
		float MinIntegral;
		unsigned short DotSampleRate;

		unsigned short GasConstant;//values in 0.1 units

		float MaxEct;
		float MinEct;
		unsigned char EctResolution;
		unsigned char SpeedResolution;
		float *IdleAirmass;
		unsigned short *IdleTargetRpm;
		float *IdleAirmassSpeedAdder;
		short *IdleTargetRpmSpeedAdder;
	};

	class IdleControlService_Pid : public IIdleControlService
	{
	protected:
		const IOServiceLayer::IOServiceCollection *_IOServiceCollection;
		const IdleControlService_PidConfig *_config;

		float _integral;
		unsigned int _lastReadTick = 0;
	public:
		IdleControlService_Pid(const IOServiceLayer::IOServiceCollection *iOServiceCollection, const IdleControlService_PidConfig *config);
		void Tick();
	};
}
#endif