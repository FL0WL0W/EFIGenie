#define VE_RPM_RESOLUTION 16
#define VE_MAP_RESOLUTION 16
#define IGNITION_RPM_RESOLUTION 16
#define IGNITION_MAP_RESOLUTION 16

namespace EngineManagement
{	
	class PistonEngineSDConfig : public IPistonEngineConfig
	{
	protected:
		Decoder::IDecoder *_decoder;
		IMapService *_mapService;
		IFuelTrimService *_fuelTrimService;
		uint16_t _ignitionDwellTime10Us;
		uint16_t _maxRpm;
		int16_t *_ignitionAdvanceMap;
		uint16_t *_volumetricEfficiencyMap;
		uint16_t *_injectorGramsPerMinute;
		short *_shortPulseAdder;
		short *_offset;
		uint16_t _mlPerCylinder;
		void LoadConfig(void *config);
	public:
		PistonEngineSDConfig( Decoder::IDecoder *decoder, IFuelTrimService *fuelTrimService, IMapService *mapService, void *config);
		InjectorTiming GetInjectorTiming(uint8_t cylinder);
		unsigned int GetIgnitionDwellTime10Us();
		int16_t GetIgnitionAdvance64thDegree();
	};
}