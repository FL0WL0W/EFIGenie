#include "EngineManagementServices/FuelTrimService/IFuelTrimService.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "EngineManagementServices/AfrService/IAfrService.h"
#include "Packed.h"

using namespace HardwareAbstraction;
using namespace IOServices;
using namespace CrankCamDecoders;

#if !defined(FUELTRIMSERVICE_INTERPOLATEDTABLE_H) && defined(IFUELTRIMSERVICE_H)
#define FUELTRIMSERVICE_INTERPOLATEDTABLE_H
namespace EngineManagementServices
{
	PACK(
	struct FuelTrimService_InterpolatedTableConfig
	{
	private:
		FuelTrimService_InterpolatedTableConfig()
		{

		}
	public:
		static FuelTrimService_InterpolatedTableConfig* Cast(void *p)
		{
			FuelTrimService_InterpolatedTableConfig *ret = (FuelTrimService_InterpolatedTableConfig *)p;

			ret->RpmDivisions = (unsigned short *)(ret + 1);
			ret->YDivisions = (float *)(ret->RpmDivisions + ret->RpmResolution);

			return ret;
		}
		unsigned int Size()
		{
			return sizeof(FuelTrimService_InterpolatedTableConfig) +
				sizeof(unsigned short) * RpmResolution +
				sizeof(float) * YResolution;
		}
		unsigned short UpdateRate;
		unsigned short CycleDelay;
		float P;
		float I;
		float D;
		unsigned char RpmResolution;
		unsigned short *RpmDivisions;
		unsigned short RpmInterpolationDistance;
		bool UseTps;
		unsigned char YResolution;
		float *YDivisions;
		float YInterpolationDistance;
		bool IsPid;
		float LambdaDeltaEnable;
	});

	class FuelTrimService_InterpolatedTable : public IFuelTrimService
	{
	protected:
		const FuelTrimService_InterpolatedTableConfig *_config;
		ITimerService *_timerService;
		ICrankCamDecoder *_decoder;
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
			ICrankCamDecoder *decoder,
			IFloatInputService *throttlePositionService, 
			IFloatInputService *manifoldAbsolutePressureService, 
			IFloatInputService *lambdaSensorService,
			IAfrService *afrService);
		short GetFuelTrim(unsigned char cylinder);
		void Tick();
	};
}
#endif