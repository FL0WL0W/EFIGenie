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
		Decoder::IDecoder *_decoder;
		IMapService *_mapService; 
		ITpsService *_tpsService;
		IIntakeAirTemperatureService *_iatService;
		IEngineCoolantTemperatureService *_ectService;
		IVoltageService *_voltageService;
		IAfrService *_afrService;
		PistonEngineConfig *_pistonEngineConfig;
		IFuelTrimService *_fuelTrimService;
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
		void LoadConfig(void *config);
	public:
		PistonEngineInjectionConfig_SD(
			Decoder::IDecoder *decoder, 
			IFuelTrimService *fuelTrimService, 
			IMapService *mapService, 
			ITpsService *tpsService, 
			IIntakeAirTemperatureService *iatService, 
			IEngineCoolantTemperatureService *ectService, 
			IVoltageService *voltageService, 
			IAfrService *afrService,
			PistonEngineConfig *pistonEngineConfig,
			void *config);
		InjectorTiming GetInjectorTiming(uint8_t cylinder);
	};
}