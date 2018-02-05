#define AFR_RPM_RESOLUTION 16
#define AFR_MAP_RESOLUTION 16

namespace EngineManagement
{
	class AfrService_Map_Ethanol : public IAfrService
	{
	protected:
		Decoder::IDecoder *_decoder;
		IMapService *_mapService;
		IEthanolService *_ethanolService;
		PistonEngineConfig *_pistonEngineConfig;
		unsigned short *_gasMap;
		unsigned short *_ethanolMap;
		void LoadConfig(void *config);
	public:
		AfrService_Map_Ethanol(Decoder::IDecoder *decoder, PistonEngineConfig *pistonEngineConfig, IMapService *mapService, IEthanolService *ethanolService, void *config);
		float GetAfr();
	};
}