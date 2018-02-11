#define AFR_RPM_RESOLUTION 16
#define AFR_MAP_RESOLUTION 16
#define AFR_ECT_RESOLUTION 8
#define AFR_TPS_RESOLUTION 8

namespace EngineManagement
{
	class AfrService_Map_Ethanol : public IAfrService
	{
	protected:
		Decoder::IDecoder *_decoder;
		IMapService *_mapService;
		ITpsService *_tpsService;
		IEthanolService *_ethanolService;
		PistonEngineConfig *_pistonEngineConfig;
		IEngineCoolantTemperatureService *_ectService;
		unsigned short *_gasMap;
		unsigned short *_ethanolMap;
		unsigned short _maxRpm;
		float _maxMapKpa;
		float _minEct;
		float _maxEct;
		float *_ectMultiplierTable;
		float *_tpsMinAfr;
		void LoadConfig(void *config);
	public:
		AfrService_Map_Ethanol(Decoder::IDecoder *decoder, PistonEngineConfig *pistonEngineConfig, IMapService *mapService, ITpsService *tpsService, IEngineCoolantTemperatureService *ectService, IEthanolService *ethanolService, void *config);
		float GetAfr();
	};
}