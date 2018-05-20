#include "IAfrService.h"
#include "IDecoder.h"
#include "PistonEngineConfig.h"
#include "IPistonEngineInjectionConfig.h"
#include "Interpolation.h"
#include "IFloatInputService.h"
#include "IFuelTrimService.h"

using namespace IOService;
using namespace ApplicationService;
using namespace Decoder;
using namespace Interpolation;

#if !defined(PISTONENGINEINJECTIONCONFIG_SD_H) && defined(IPISTONENGINEINJECTIONCONFIG_H) && defined(IAFRSERVICE_H) && defined(IDECODER_H)
#define PISTONENGINEINJECTIONCONFIG_SD_H
namespace EngineManagement
{	
	struct __attribute__((__packed__)) PistonEngineInjectionConfig_SDConfig
	{
	private:
		PistonEngineInjectionConfig_SDConfig()
		{
			
		}
	public:
		static PistonEngineInjectionConfig_SDConfig * Cast(void *p)
		{
			PistonEngineInjectionConfig_SDConfig *ret = (PistonEngineInjectionConfig_SDConfig *)p;

			ret->VolumetricEfficiencyMap = (unsigned short *)(ret + 1);
			ret->ShortPulseAdder = (short *)(ret->VolumetricEfficiencyMap + ret->VeRpmResolution * ret->VeMapResolution);
			ret->Offset = (ret->ShortPulseAdder + (int)(ret->ShortPulseLimit / 0.00006f) + 1);
			ret->TemperatureBias = (unsigned char *)(ret->Offset + ret->OffsetMapResolution *ret->OffsetVoltageResolution);
			ret->TpsDotAdder = (short *)(ret->TemperatureBias + ret->TemperatureBiasResolution);
			ret->MapDotAdder = ret->TpsDotAdder + ret->TpsDotAdderResolution;

			return ret;
		}
		
		unsigned int Size()
		{
			return sizeof(PistonEngineInjectionConfig_SDConfig) +
				sizeof(unsigned short) * VeRpmResolution * VeMapResolution +
				sizeof(short) * ((int)(ShortPulseLimit / 0.00006f) + 1) +
				sizeof(short) * OffsetMapResolution * OffsetVoltageResolution +
				sizeof(unsigned char) * TemperatureBiasResolution +
				sizeof(short) * TpsDotAdderResolution +
				sizeof(short) * MapDotAdderResolution;
		}
		
		unsigned short GasConstant;
		unsigned short InjectorOpenPosition64thDegree;
		
		unsigned short MaxRpm;
		float MaxMap;
		unsigned char VeRpmResolution;
		unsigned char VeMapResolution;
		unsigned short *VolumetricEfficiencyMap;
		
		unsigned short InjectorGramsPerMinute[MAX_CYLINDERS];
		
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
	};
	
class PistonEngineInjectionConfig_SD : public IPistonEngineInjectionConfig
	{
	protected:
		PistonEngineInjectionConfig_SDConfig *_config;
		PistonEngineConfig *_pistonEngineConfig;
		IDecoder *_decoder;
		IFloatInputService *_manifoldAbsolutePressureService;
		IAfrService *_afrService;
		IFuelTrimService *_fuelTrimService;
		IFloatInputService *_intakeAirTemperatureService;
		IFloatInputService *_engineCoolantTemperatureService;
		IFloatInputService *_throttlePositionService;
		IFloatInputService *_voltageService;
		
	public:
		PistonEngineInjectionConfig_SD(
			PistonEngineInjectionConfig_SDConfig *config, 
			PistonEngineConfig *pistonEngineConfig, 
			IDecoder *decoder,
			IFloatInputService *manifoldAbsolutePressureService,
			IAfrService *afrService,
			IFuelTrimService *fuelTrimService,
			IFloatInputService *intakeAirTemperatureService,
			IFloatInputService *engineCoolantTemperatureService,
			IFloatInputService *throttlePositionService,
			IFloatInputService *voltageService);
		InjectorTiming GetInjectorTiming(unsigned char cylinder);
	};
}
#endif