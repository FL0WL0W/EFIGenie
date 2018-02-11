#define IGNITION_RPM_RESOLUTION 16
#define IGNITION_MAP_RESOLUTION 16

namespace EngineManagement
{
	class PistonEngineIgnitionConfig_Map_Ethanol : public IPistonEngineIgnitionConfig
	{
	protected:
		PistonEngineConfig *_pistonEngineConfig;
		float _ignitionDwellTime;
		short *_ignitionAdvanceMapGas;
		short *_ignitionAdvanceMapEthanol;
		unsigned short _maxRpm;
		float _maxMapKpa;
		void LoadConfig(void *config);
	public:
		PistonEngineIgnitionConfig_Map_Ethanol(
			PistonEngineConfig *pistonEngineConfig,
			void *config);
		IgnitionTiming GetIgnitionTiming();
	};
}