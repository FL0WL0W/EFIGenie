#include "EngineControlServices/AfrService/IAfrService.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "EngineControlServices/InjectionService/IInjectionConfig.h"
#include "Interpolation.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "EngineControlServices/FuelTrimService/IFuelTrimService.h"
#include "Packed.h"

using namespace IOServices;
using namespace CrankCamDecoders;
using namespace Interpolation;

#if !defined(INJECTIONCONFIG_SD_H) && defined(IINJECTIONCONFIG_H) && defined(IAFRSERVICE_H) && defined(ICRANKCAMDECODER_H)
#define INJECTIONCONFIG_SD_H
namespace EngineControlServices
{	
	PACK(
	struct InjectionConfig_SDConfig
	{
	private:
		InjectionConfig_SDConfig()
		{
			
		}
	public:
		const unsigned int Size() const
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
		const unsigned short *VolumetricEfficiencyMap() const { return (const unsigned short *)(this + 1); }
		const unsigned short *InjectorGramsPerMinute() const { return (const unsigned short *)((const unsigned short *)(this + 1) + VeRpmResolution * VeMapResolution); }
		const short *ShortPulseAdder() const { return (const short *)((const unsigned short *)((const unsigned short *)(this + 1) + VeRpmResolution * VeMapResolution) + Injectors); }
		const short *Offset() const { return (const short *)((const unsigned short *)((const unsigned short *)(this + 1) + VeRpmResolution * VeMapResolution) + Injectors) + ShortPulseAdderResolution; }
		const unsigned char *TemperatureBias() const { return (const unsigned char *)((const short *)((const unsigned short *)((const unsigned short *)(this + 1) + VeRpmResolution * VeMapResolution) + Injectors) + ShortPulseAdderResolution + OffsetMapResolution * OffsetVoltageResolution); }
		const short *TpsDotAdder() const { return (const short *)((const unsigned char *)((const short *)((const unsigned short *)((const unsigned short *)(this + 1) + VeRpmResolution * VeMapResolution) + Injectors) + ShortPulseAdderResolution + OffsetMapResolution * OffsetVoltageResolution) + TemperatureBiasResolution); }
		const short *MapDotAdder() const { return (const short *)((const unsigned char *)((const short *)((const unsigned short *)((const unsigned short *)(this + 1) + VeRpmResolution * VeMapResolution) + Injectors) + ShortPulseAdderResolution + OffsetMapResolution * OffsetVoltageResolution) + TemperatureBiasResolution) + TpsDotAdderResolution; }
		
		unsigned short GasConstant;//value in 0.1 unit
		unsigned short Ml8thPerCylinder;
		unsigned short InjectorOpenPosition64thDegree;
		
		unsigned short MaxRpm;
		float MaxMap;
		unsigned char VeRpmResolution;
		unsigned char VeMapResolution;
		
		unsigned char Injectors;
		
		float ShortPulseLimit;
		unsigned char ShortPulseAdderResolution;
		
		float VoltageMax;
		float VoltageMin;
		unsigned char OffsetMapResolution;
		unsigned char OffsetVoltageResolution;
		
		unsigned char TemperatureBiasResolution;
		float MaxTemperatureBias;
		
		float MaxTpsDot;
		unsigned char TpsDotAdderResolution;
		
		float MaxMapDot;
		unsigned char MapDotAdderResolution;
	});
	
class InjectionConfig_SD : public IInjectionConfig
	{
	protected:
		const InjectionConfig_SDConfig *_config;
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
			const InjectionConfig_SDConfig *config, 
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