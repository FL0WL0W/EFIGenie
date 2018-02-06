namespace EngineManagement
{
	HardwareAbstraction::ITimerService *CurrentTimerService;
	HardwareAbstraction::IDigitalService *CurrentDigitalService;
	HardwareAbstraction::IAnalogService *CurrentAnalogService;
	IIgnitorService *CurrentIgnitorServices[MAX_CYLINDERS];
	IInjectorService *CurrentInjectorServices[MAX_CYLINDERS];
	IMapService *CurrentMapService;
	IFuelTrimService *CurrentFuelTrimService;
	IEngineCoolantTemperatureService *CurrentEngineCoolantTemperatureService;
	IIntakeAirTemperatureService *CurrentIntakeAirTemperatureService;
	IVoltageService *CurrentVoltageService;
	IEthanolService *CurrentEthanolService;
	IAfrService *CurrentAfrService;
	PistonEngineConfig *CurrentPistonEngineConfig;
	IPistonEngineInjectionConfig *CurrentPistonEngineInjectionConfig;
	IPistonEngineIgnitionConfig *CurrentPistonEngineIgnitionConfig;
	PistonEngineController *CurrentPistonEngineController;
	Decoder::IDecoder *CurrentDecoder;
	
	void CreateServices(
		HardwareAbstraction::ITimerService timerService,
		HardwareAbstraction::IDigitalService digitalService,
		HardwareAbstraction::IAnalogService analogService)
}