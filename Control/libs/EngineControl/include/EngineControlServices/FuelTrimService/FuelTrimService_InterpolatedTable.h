#include "EngineControlServices/FuelTrimService/IFuelTrimService.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "Reluctor/IReluctor.h"
#include "EngineControlServices/AfrService/IAfrService.h"
#include "Packed.h"
#include "math.h"

using namespace HardwareAbstraction;
using namespace IOServices;
using namespace Reluctor;

#if !defined(FUELTRIMSERVICE_INTERPOLATEDTABLE_H) && defined(IFUELTRIMSERVICE_H)
#define FUELTRIMSERVICE_INTERPOLATEDTABLE_H
namespace EngineControlServices
{
	PACK(
	struct FuelTrimService_InterpolatedTableConfig
	{
	private:
		FuelTrimService_InterpolatedTableConfig()
		{

		}
	public:
		const unsigned int Size() const
		{
			return sizeof(FuelTrimService_InterpolatedTableConfig) +
				sizeof(unsigned short) * RpmResolution +
				sizeof(float) * YResolution;
		}
	
		const unsigned short *RpmDivisions() const { return (const unsigned short *)(this + 1); }
		const float *YDivisions() const { return (const float *)((const unsigned short *)(this + 1) + RpmResolution); }

		unsigned short UpdateRate;
		unsigned short CycleDelay;
		float P;
		float I;
		float D;
		unsigned char RpmResolution;
		unsigned short RpmInterpolationDistance;
		bool UseTps;
		unsigned char YResolution;
		float YInterpolationDistance;
		bool IsPid;
		float LambdaDeltaEnable;
	});

	class FuelTrimService_InterpolatedTable : public IFuelTrimService
	{
	protected:
		const FuelTrimService_InterpolatedTableConfig *_config;
		ITimerService *_timerService;
		IReluctor *_reluctor;
		IFloatInputService *_throttlePositionService;
		IFloatInputService *_manifoldAbsolutePressureService;
		IFloatInputService *_lambdaSensorService;
		IAfrService *_afrService;

		float _lastError;
		short *_fuelTrimIntegralTable;
		short _fuelTrim;
		unsigned int _rpmDot;
		unsigned short _prevRpm;
		unsigned int _prevTick;
	public:
		FuelTrimService_InterpolatedTable(
			const FuelTrimService_InterpolatedTableConfig *config, 
			ITimerService *timerService, 
			IReluctor *reluctor,
			IFloatInputService *throttlePositionService, 
			IFloatInputService *manifoldAbsolutePressureService, 
			IFloatInputService *lambdaSensorService,
			IAfrService *afrService);
		short GetFuelTrim(unsigned char cylinder);
		void Tick();
	};
}
#endif