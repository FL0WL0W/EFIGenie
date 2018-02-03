#define VE_RPM_RESOLUTION 16
#define VE_MAP_RESOLUTION 16
#define INJECTOR_OFFSET_MAP_RESOLUTION 16
#define INJECTOR_OFFSET_VOLTAGE_RESOLUTION 16
#define INJECTOR_OFFSET_VOLTAGE_MAX 16
#define INJECTOR_OFFSET_VOLTAGE_MIN 8
#define TEMPERATURE_BIAS_RESOLUTION 16

namespace EngineManagement
{	
	class PistonEngineInjectionSDConfig : public IPistonEngineInjectionConfig
	{
	protected:
		Decoder::IDecoder *_decoder;
		IMapService *_mapService;
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
		unsigned short _injectorOpenPosition64thDegree;
		void LoadConfig(void *config);
	public:
		PistonEngineInjectionSDConfig(
			Decoder::IDecoder *decoder, 
			IFuelTrimService *fuelTrimService, 
			IMapService *mapService, 
			IIntakeAirTemperatureService *iatService, 
			IEngineCoolantTemperatureService *ectService, 
			IVoltageService *voltageService, 
			IAfrService *afrService,
			PistonEngineConfig *pistonEngineConfig,
			void *config);
		InjectorTiming GetInjectorTiming(uint8_t cylinder);
	};
}