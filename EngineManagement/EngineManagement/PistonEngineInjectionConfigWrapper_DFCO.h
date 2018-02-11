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
			ITpsService *tpsService,
			void *config);
		InjectorTiming GetInjectorTiming(unsigned char cylinder);
	};
}