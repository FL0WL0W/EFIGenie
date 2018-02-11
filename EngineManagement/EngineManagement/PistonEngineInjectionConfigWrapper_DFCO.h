namespace EngineManagement
{
	class PistonEngineInjectionConfigWrapper_DFCO : public IPistonEngineInjectionConfig
	{
	protected:
		IPistonEngineInjectionConfig *_child;
		Decoder::IDecoder *_decoder;
		ITpsService *_tpsService;
		float _tpsEnable;
		unsigned short _rpmEnable;
		unsigned short _rpmDisable;
		bool _dfcoEnabled;
	public:
		PistonEngineInjectionConfigWrapper_DFCO(
			Decoder::IDecoder *decoder,
			IFuelTrimService *fuelTrimService,
			IMapService *mapService,
			ITpsService *tpsService,
			IIntakeAirTemperatureService *iatService,
			IEngineCoolantTemperatureService *ectService,
			IVoltageService *voltageService,
			IAfrService *afrService,
			PistonEngineConfig *pistonEngineConfig,
			void *config);
		InjectorTiming GetInjectorTiming(uint8_t cylinder);
	};
}