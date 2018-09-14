#include "EngineManagementServices/AfrService/IAfrService.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "EngineManagementServices/InjectionService/IInjectionConfig.h"
#include "Interpolation.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "EngineManagementServices/FuelTrimService/IFuelTrimService.h"
#include "Packed.h"

using namespace IOServices;
using namespace CrankCamDecoders;
using namespace Interpolation;

#if !defined(INJECTIONCONFIG_SD_H) && defined(IINJECTIONCONFIG_H) && defined(IAFRSERVICE_H) && defined(ICRANKCAMDECODER_H)
#define INJECTIONCONFIG_SD_H
namespace EngineManagementServices
{	
	PACK(
	struct InjectionConfig_SDConfig
	{
	private:
		InjectionConfig_SDConfig()
		{
			
		}
	public:
		static InjectionConfig_SDConfig * Cast(void *p)
		{
			InjectionConfig_SDConfig *ret = (InjectionConfig_SDConfig *)p;

			ret->VolumetricEfficiencyMap = (unsigned short *)(ret + 1);
			ret->InjectorGramsPerMinute = (unsigned short *)(ret->VolumetricEfficiencyMap + ret->VeRpmResolution * ret->VeMapResolution);
			ret->ShortPulseAdder = (short *)(ret->InjectorGramsPerMinute + ret->Injectors);
			ret->Offset = (ret->ShortPulseAdder + (int)(ret->ShortPulseLimit / 0.00006f) + 1);
			ret->TemperatureBias = (unsigned char *)(ret->Offset + ret->OffsetMapResolution *ret->OffsetVoltageResolution);
			ret->TpsDotAdder = (short *)(ret->TemperatureBias + ret->TemperatureBiasResolution);
			ret->MapDotAdder = ret->TpsDotAdder + ret->TpsDotAdderResolution;

			return ret;
		}
		
		unsigned int Size()
		{
			return sizeof(InjectionConfig_SDConfig) +
				sizeof(unsigned short) * VeRpmResolution * VeMapResolution +
				sizeof(unsigned short) * Injectors +
				sizeof(short) * ((int)(ShortPulseLimit / 0.00006f) + 1) +
				sizeof(short) * OffsetMapResolution * OffsetVoltageResolution +
				sizeof(unsigned char) * TemperatureBiasResolution +
				sizeof(short) * TpsDotAdderResolution +
				sizeof(short) * MapDotAdderResolution;
		}
		
		unsigned short GasConstant;//value in 0.1 unit
		unsigned short Ml8thPerCylinder;
		unsigned short InjectorOpenPosition64thDegree;
		
		unsigned short MaxRpm;
		float MaxMap;
		unsigned char VeRpmResolution;
		unsigned char VeMapResolution;
		unsigned short *VolumetricEfficiencyMap;
		
		unsigned char Injectors;
		unsigned short *InjectorGramsPerMinute;
		
		float ShortPulseLimit;
		short *ShortPulseAdder;
		
		float VoltageMax;
		float VoltageMin;
		unsigned char OffsetMapResolution;
		unsigned char OffsetVoltageResolution;
		short *Offset;
		
		unsigned char TemperatureBiasResolution;
		float MaxTemperatureBias;
		unsigned char *TemperatureBias;
		
		float MaxTpsDot;
		unsigned char TpsDotAdderResolution;
		short *TpsDotAdder;		
		
		float MaxMapDot;
		unsigned char MapDotAdderResolution;
		short *MapDotAdder;
	});
	
class InjectionConfig_SD : public IInjectionConfig
	{
	protected:
		InjectionConfig_SDConfig *_config;
		ICrankCamDecoder *_decoder;
		IFloatInputService *_manifoldAbsolutePressureService;
		IAfrService *_afrService;
		IFuelTrimService *_fuelTrimService;
		IFloatInputService *_intakeAirTemperatureService;
		IFloatInputService *_engineCoolantTemperatureService;
		IFloatInputService *_throttlePositionService;
		IFloatInputService *_voltageService;
		
	public:
		InjectionConfig_SD(
			InjectionConfig_SDConfig *config, 
			ICrankCamDecoder *decoder,
			IFloatInputService *manifoldAbsolutePressureService,
			IAfrService *afrService,
			IFuelTrimService *fuelTrimService,
			IFloatInputService *intakeAirTemperatureService,
			IFloatInputService *engineCoolantTemperatureService,
			IFloatInputService *throttlePositionService,
			IFloatInputService *voltageService);
		InjectorTiming GetInjectorTiming(unsigned char injector);
	};
}
#endif