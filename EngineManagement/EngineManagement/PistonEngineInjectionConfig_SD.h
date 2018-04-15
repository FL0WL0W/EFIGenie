#if defined(IPistonEngineInjectionConfigExists) && defined(IAfrServiceExists)
#define PistonEngineInjectionConfig_SDExists
namespace EngineManagement
{	
	struct PistonEngineInjectionConfig_SDConfig
	{
		unsigned short GasConstant;
		unsigned short InjectorOpenPosition64thDegree;
		
		unsigned short MaxRpm;
		float MaxMapBar;
		unsigned char VeRpmResolution;
		unsigned char VeMapResolution;
		unsigned short *VolumetricEfficiencyMap;
		
		unsigned short *InjectorGramsPerMinute;
		
		float ShortPulseLimit;
		short *ShortPulseAdder;
		
		float VoltageMax;
		float VoltageMin;
		unsigned char OffsetMapResolution;
		unsigned char OffsetVoltageResolution;
		short *Offset;
		
		unsigned char TemperatureBiasResolution;
		unsigned char *TemperatureBias;
		
		float MaxTpsDot;
		unsigned char TpsDotAdderResolution;
		short *TpsDotAdder;		
		
		float MaxMapBarDot;
		unsigned char MapDotAdderResolution;
		short *MapDotAdder;
	};
	
class PistonEngineInjectionConfig_SD : public IPistonEngineInjectionConfig
	{
	protected:
		PistonEngineConfig *_pistonEngineConfig;
		
	public:
		PistonEngineInjectionConfig_SD(void *config);
		InjectorTiming GetInjectorTiming(unsigned char cylinder);
	};
}
#endif