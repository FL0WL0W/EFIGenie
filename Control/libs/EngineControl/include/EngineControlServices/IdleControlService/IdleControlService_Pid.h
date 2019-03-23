#include "EngineControlServices/IdleControlService/IIdleControlService.h"
#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "EngineControlServices/RpmService/RpmService.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "IOServices/FloatOutputService/IFloatOutputService.h"
#include "Packed.h"
#include "math.h"

using namespace HardwareAbstraction;
using namespace Reluctor;
using namespace IOServices;

#if !defined(IDLECONTROLSERVICE_PID_H) && defined(IIDLECONTROLSERVICE_H)
#define IDLECONTROLSERVICE_PID_H
namespace EngineControlServices
{
	PACK(
	struct IdleControlService_PidConfig
	{
	private:
		IdleControlService_PidConfig()
		{

		}
	public:
		const unsigned int Size() const
		{
			return sizeof(IdleControlService_PidConfig) + 
				(sizeof(float) * EctResolution) + 
				(sizeof(unsigned short) * EctResolution) +
				(sizeof(float)) * SpeedResolution +
				(sizeof(short)) * SpeedResolution;
		}

		const float *IdleAirmass() const { return (const float *)(this + 1); }
		const unsigned short *IdleTargetRpm() const { return (const unsigned short *)((const float *)(this + 1) + EctResolution); }
		const float *IdleAirmassSpeedAdder() const { return (const float *)((const unsigned short *)((const float *)(this + 1) + EctResolution) + EctResolution); }
		const unsigned short *IdleTargetRpmSpeedAdder() const { return (const unsigned short *)((const float *)((const unsigned short *)((const float *)(this + 1) + EctResolution) + EctResolution) + SpeedResolution); }

		float TpsThreshold;
		unsigned char SpeedThreshold;
		float P;
		float I;
		float D;
		float MaxIntegral;
		float MinIntegral;
		unsigned short DotSampleRate;

		char MaxEct;
		char MinEct;
		unsigned char EctResolution;
		unsigned char SpeedResolution;
	});

	class IdleControlService_Pid : public IIdleControlService
	{
	protected:
		const IdleControlService_PidConfig *_config;
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		RpmService *_rpmService;
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
			RpmService *rpmService, 
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