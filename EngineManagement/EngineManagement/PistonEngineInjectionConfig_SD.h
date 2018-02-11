#define VE_RPM_RESOLUTION 16
#define VE_MAP_RESOLUTION 16
#define INJECTOR_OFFSET_MAP_RESOLUTION 16
#define INJECTOR_OFFSET_VOLTAGE_RESOLUTION 16
#define INJECTOR_OFFSET_VOLTAGE_MAX 16
#define INJECTOR_OFFSET_VOLTAGE_MIN 8
#define TEMPERATURE_BIAS_RESOLUTION 16
#define TPSDOT_ADDER_RESOLUTION 16
#define MAPDOT_ADDER_RESOLUTION 16

namespace EngineManagement
{	
	class PistonEngineInjectionConfig_SD : public IPistonEngineInjectionConfig
	{
	protected:
		PistonEngineConfig *_pistonEngineConfig;
		unsigned short *_volumetricEfficiencyMap;
		unsigned short *_injectorGramsPerMinute;
		float _shortPulseLimit;
		short *_shortPulseAdder;
		short *_offset;
		unsigned short _gasConstant;
		unsigned char *_temperatureBias;
		short *_tpsDotAdder;
		short *_mapDotAdder;
		unsigned short _maxRpm;
		float _maxMapKpa;
		float _maxMapKpaDot;
		float _maxTpsDot;
		unsigned short _injectorOpenPosition64thDegree;
	public:
		PistonEngineInjectionConfig_SD(
			PistonEngineConfig *pistonEngineConfig,
			void *config);
		InjectorTiming GetInjectorTiming(unsigned char cylinder);
	};
}