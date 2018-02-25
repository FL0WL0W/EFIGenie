#if defined(IPistonEngineInjectionConfig) && defined(IAfrServiceExists) && defined(IMapServiceExists)
#define PistonEngineInjectionConfig_SDExists
namespace EngineManagement
{	
	class PistonEngineInjectionConfig_SD : public IPistonEngineInjectionConfig
	{
	protected:
		PistonEngineConfig *_pistonEngineConfig;
		unsigned short *_volumetricEfficiencyMap;
		unsigned short *_injectorGramsPerMinute;
		short *_shortPulseAdder;
		short *_offset;
		float _shortPulseLimit;
		unsigned short _gasConstant;
		unsigned char *_temperatureBias;
		
#ifdef ITpsServiceExists
		float _maxTpsDot;
		unsigned char _tpsDotAdderResolution;
		short *_tpsDotAdder;
#endif
		
		short *_mapDotAdder;
		unsigned short _injectorOpenPosition64thDegree;
		unsigned short _maxRpm;
		float _maxMapKpa;
		float _maxMapKpaDot;
		float _voltageMax;
		float _voltageMin;
		unsigned char _veRpmResolution;
		unsigned char _veMapResolution;
		unsigned char _offsetMapResolution;
		unsigned char _offsetVoltageResolution;
		unsigned char _temperatureBiasResolution;
		unsigned char _mapDotAdderResolution;
		
	public:
		PistonEngineInjectionConfig_SD(void *config);
		InjectorTiming GetInjectorTiming(unsigned char cylinder);
	};
}
#endif