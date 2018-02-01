#define VE_RPM_RESOLUTION 16
#define VE_MAP_RESOLUTION 16
#define IGNITION_RPM_RESOLUTION 16
#define IGNITION_MAP_RESOLUTION 16
#define INJECTOR_OFFSET_MAP_RESOLUTION 16
#define INJECTOR_OFFSET_VOLTAGE_RESOLUTION 16
#define INJECTOR_OFFSET_VOLTAGE_MAX 16
#define INJECTOR_OFFSET_VOLTAGE_MIN 8

namespace EngineManagement
{	
	class PistonEngineSDConfig : public IPistonEngineConfig
	{
	protected:
		Decoder::IDecoder *_decoder;
		IMapService *_mapService;
		IIntakeAirTemperatureService *_iacService;
		IEngineCoolantTemperatureService *_ectService;
		IVoltageService *_voltageService;
		IAfrService *_afrService;
		IFuelTrimService *_fuelTrimService;
		uint16_t _ignitionDwellTime10Us;
		uint16_t _maxRpm;
		int16_t *_ignitionAdvanceMap;
		uint16_t *_volumetricEfficiencyMap;
		uint16_t *_injectorGramsPerMinute;
		short *_shortPulseAdder;
		short *_offset;
		uint16_t _mlPerCylinder; //ml * 8
		unsigned short _gasConstant;
		unsigned char _temperatureBias;
		unsigned short _injectorOpenPosition64thDegree;
		void LoadConfig(void *config);
	public:
		PistonEngineSDConfig(
			Decoder::IDecoder *decoder, 
			IFuelTrimService *fuelTrimService, 
			IMapService *mapService, 
			IIntakeAirTemperatureService *iacService, 
			IEngineCoolantTemperatureService *ectService, 
			IVoltageService *voltageService, 
			IAfrService *afrService,
			void *config);
		InjectorTiming GetInjectorTiming(uint8_t cylinder);
		unsigned int GetIgnitionDwellTime10Us();
		int16_t GetIgnitionAdvance64thDegree();
	};
}