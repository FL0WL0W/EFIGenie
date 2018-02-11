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
		unsigned char _ignitionRpmResolution;
		unsigned char _ignitionMapResolution;
	public:
		PistonEngineIgnitionConfig_Map_Ethanol(
			PistonEngineConfig *pistonEngineConfig,
			void *config);
		IgnitionTiming GetIgnitionTiming();
	};
}