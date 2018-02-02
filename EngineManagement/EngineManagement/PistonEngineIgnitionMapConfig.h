#define IGNITION_RPM_RESOLUTION 16
#define IGNITION_MAP_RESOLUTION 16

namespace EngineManagement
{
	class PistonEngineIgnitionMapConfig : public IPistonEngineIgnitionConfig
	{
	protected:
		Decoder::IDecoder *_decoder;
		IMapService *_mapService;
		IIntakeAirTemperatureService *_iatService;
		IEngineCoolantTemperatureService *_ectService;
		IVoltageService *_voltageService;
		IAfrService *_afrService;
		PistonEngineConfig *_pistonEngineConfig;
		float _ignitionDwellTime;
		short *_ignitionAdvanceMap;
		void LoadConfig(void *config);
	public:
		PistonEngineIgnitionMapConfig(
			Decoder::IDecoder *decoder,
			IMapService *mapService,
			IIntakeAirTemperatureService *iatService,
			IEngineCoolantTemperatureService *ectService,
			IVoltageService *voltageService,
			IAfrService *afrService,
			PistonEngineConfig *pistonEngineConfig,
			void *config);
		IgnitionTiming GetIgnitionTiming();
	};
}