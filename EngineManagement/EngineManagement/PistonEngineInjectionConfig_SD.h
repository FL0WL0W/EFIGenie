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
		short *_tpsDotAdder;
		short *_mapDotAdder;
		unsigned short _injectorOpenPosition64thDegree;
		unsigned short _maxRpm;
		float _maxMapKpa;
		float _maxMapKpaDot;
		float _maxTpsDot;
		float _voltageMax;
		float _voltageMin;
		unsigned char _veRpmResolution;
		unsigned char _veMapResolution;
		unsigned char _offsetMapResolution;
		unsigned char _offsetVoltageResolution;
		unsigned char _temperatureBiasResolution;
		unsigned char _tpsDotAdderResolution;
		unsigned char _mapDotAdderResolution;
		
	public:
		PistonEngineInjectionConfig_SD(
			PistonEngineConfig *pistonEngineConfig,
			void *config);
		InjectorTiming GetInjectorTiming(unsigned char cylinder);
	};
}