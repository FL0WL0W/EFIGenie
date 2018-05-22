#include "IIdleControlService.h"
#include "HardwareAbstractionCollection.h"
#include "IDecoder.h"
#include "IFloatInputService.h"
#include "IFloatOutputService.h"

using namespace HardwareAbstraction;
using namespace Decoder;
using namespace IOService;

#if !defined(IDLECONTROLSERVICE_PID_H) && defined(IIDLECONTROLSERVICE_H)
#define IDLECONTROLSERVICE_PID_H
namespace ApplicationService
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
		unsigned int Size()
		{
			return sizeof(IdleControlService_PidConfig) + 
				(sizeof(float) * EctResolution) + 
				(sizeof(unsigned short) * EctResolution) +
				(sizeof(float)) * SpeedResolution +
				(sizeof(short)) * SpeedResolution;
		}
		float TpsThreshold;
		unsigned char SpeedThreshold;
		float P;
		float I;
		float D;
		float MaxIntegral;
		float MinIntegral;
		unsigned short DotSampleRate;

		unsigned short GasConstant;//values in 0.1 units

		unsigned short MaxEct;
		unsigned short MinEct;
		unsigned char EctResolution;
		float *IdleAirmass;
		unsigned short *IdleTargetRpm;
		unsigned char SpeedResolution;
		float *IdleAirmassSpeedAdder;
		short *IdleTargetRpmSpeedAdder;
	};

	class IdleControlService_Pid : public IIdleControlService
	{
	protected:
		const IdleControlService_PidConfig *_config;
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		IDecoder *_decoder;
		IFloatInputService *_throttlePositionService;
		IFloatInputService *_engineCoolantTemperatureService;
		IFloatInputService *_vehicleSpeedService;
		IFloatInputService *_intakeAirTemperatureService;
		IFloatInputService *_manifoldAbsolutePressureService;
		IFloatOutputService *_idleAirControlValveService;

		float _integral;
		unsigned int _lastReadTick = 0;
	public:
		IdleControlService_Pid(
			const IdleControlService_PidConfig *config, 
			const HardwareAbstractionCollection *hardwareAbstractionCollection, 
			IDecoder *decoder, 
			IFloatInputService *throttlePositionService, 
			IFloatInputService *engineCoolantTemperatureService, 
			IFloatInputService *vehicleSpeedService,
			IFloatInputService *intakeAirTemperatureService, 
			IFloatInputService *manifoldAbsolutePressureService,
			IFloatOutputService *idleAirControlValveService);
		void Tick();
	};
}
#endif