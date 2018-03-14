#if defined(IPistonEngineIgnitionConfigExists)
#define PistonEngineIgnitionConfig_Map_EthanolExists
namespace EngineManagement
{
	class PistonEngineIgnitionConfig_Map_Ethanol : public IPistonEngineIgnitionConfig
	{
	protected:
		float _ignitionDwellTime;
		short *_ignitionAdvanceMapGas;
		short *_ignitionAdvanceMapEthanol;
		unsigned short _maxRpm;
		float _maxMapBar;
		unsigned char _ignitionRpmResolution;
		unsigned char _ignitionMapResolution;
	public:
		PistonEngineIgnitionConfig_Map_Ethanol(void *config);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif