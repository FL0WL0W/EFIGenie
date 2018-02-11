#define AFR_RPM_RESOLUTION 16
#define AFR_MAP_RESOLUTION 16
#define AFR_ECT_RESOLUTION 8
#define AFR_TPS_RESOLUTION 8

namespace EngineManagement
{
	class AfrService_Map_Ethanol : public IAfrService
	{
	protected:
		unsigned short *_gasMap;
		unsigned short *_ethanolMap;
		unsigned short _maxRpm;
		float _maxMapKpa;
		float _minEct;
		float _maxEct;
		float *_ectMultiplierTable;
		float *_tpsMinAfr;
	public:
		AfrService_Map_Ethanol(void *config);
		float GetAfr();
	};
}