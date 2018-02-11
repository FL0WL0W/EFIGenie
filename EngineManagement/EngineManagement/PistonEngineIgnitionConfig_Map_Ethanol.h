#define IGNITION_RPM_RESOLUTION 16
#define IGNITION_MAP_RESOLUTION 16

namespace EngineManagement
{
	class PistonEngineIgnitionConfig_Map_Ethanol : public IPistonEngineIgnitionConfig
	{
	protected:
		Decoder::IDecoder *_decoder;
		IMapService *_mapService;
		IEthanolService *_ethanolService;
		IIntakeAirTemperatureService *_iatService;
		IEngineCoolantTemperatureService *_ectService;
		IVoltageService *_voltageService;
		IAfrService *_afrService;
		PistonEngineConfig *_pistonEngineConfig;
		float _ignitionDwellTime;
		short *_ignitionAdvanceMapGas;
		short *_ignitionAdvanceMapEthanol;
		unsigned short _maxRpm;
		float _maxMapKpa;
		void LoadConfig(void *config);
	public:
		PistonEngineIgnitionConfig_Map_Ethanol(
			Decoder::IDecoder *decoder,
			IMapService *mapService,
			IEthanolService *ethanolService,
			IIntakeAirTemperatureService *iatService,
			IEngineCoolantTemperatureService *ectService,
			IVoltageService *voltageService,
			IAfrService *afrService,
			PistonEngineConfig *pistonEngineConfig,
			void *config);
		IgnitionTiming GetIgnitionTiming();
	};
}