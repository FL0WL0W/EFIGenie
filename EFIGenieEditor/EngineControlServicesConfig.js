var EngineControlServicesIni = {
    IgnitorServicesConfig: { Variables: [
        { IgnitorServicesId: { Type: "uint16", Value: 3001, Hidden: true } },
        { Coils: { Type: "uint8", Label: "Ignition Coils", Value: 4, Min: 0, Max: 16, Step: 1 } },
        { CoilConfigs: { 
            Label: "Coil",
            Labels: ["Coil 1", "Coil 2", "Coil 3", "Coil 4", "Coil 5", "Coil 6", "Coil 7", "Coil 8", "Coil 9", "Coil 10", "Coil 11", "Coil 12", "Coil 13", "Coil 14", "Coil 15", "Coil 16"], 
            ConfigName: "IBooleanOutputServiceConfig", 
            Array: "Coils"
        } }
    ] },

    InjectorServicesConfig: { Variables: [
        { InjectorServicesId: { Type: "uint16", Value: 3002, Hidden: true } },
        { Injectors: { Type: "uint8", Label: "Ignition Coils", Value: 4, Min: 0, Max: 32, Step: 1 } },
        { InjectorConfigs: { 
            Label: "Injector",
            Labels: ["Injector 1", "Injector 2", "Injector 3", "Injector 4", "Injector 5", "Injector 6", "Injector 7", "Injector 8", "Injector 9", "Injector 10", "Injector 11", "Injector 12", "Injector 13", "Injector 14", "Injector 15", "Injector 16", "Injector 17", "Injector 18", "Injector 19", "Injector 20", "Injector 21", "Injector 22", "Injector 23", "Injector 24", "Injector 25", "Injector 26", "Injector 27", "Injector 28", "Injector 29", "Injector 30", "Injector 31", "Injector 32"], 
            ConfigName: "IBooleanOutputServiceConfig", 
            Array: "Injectors"
        } }
    ] },

    IdleControlService_PidConfig: { Variables: [
        { IdleAirControlValveServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { TpsThreshold: { Type: "float", Value: 1 } },
		// float TpsThreshold;
		// unsigned char SpeedThreshold;
		// float P;
		// float I;
		// float D;
		// float MaxIntegral;
		// float MinIntegral;
		// unsigned short DotSampleRate;

		// unsigned short GasConstant;//values in 0.1 units

		// unsigned short MaxEct;
		// unsigned short MinEct;
		// unsigned char EctResolution;
		// float *IdleAirmass;
		// unsigned short *IdleTargetRpm;
		// unsigned char SpeedResolution;
		// float *IdleAirmassSpeedAdder;
		// short *IdleTargetRpmSpeedAdder;
    ] },

    IIdleControlServiceConfig: { Variables: [
        { IdleAirControlValveServiceId: { Type: "uint16", Value: 4003, Hidden: true } },
        { Selection: { Label: "Idle Air Control Valve", Selections: [
            { Name: "None", ConfigName: "NoneConfig"},
            { Name: "PID", ConfigName: "IdleControlService_PidConfig"}
        ] } }
    ] },

    SensorServices: { Tabbed: true, Variables: [
        { IntakeAirTemperatureConfig: { Label: "IAT", ConfigName: "IntakeAirTemperatureConfig"} },
        { EngineCoolantTemperatureServiceConfig: { Label: "ECT", ConfigName: "EngineCoolantTemperatureServiceConfig"} },
        { ManifoldAbsolutePressureServiceConfig: { Label: "MAP", ConfigName: "ManifoldAbsolutePressureServiceConfig"} },
        { VoltageConfig: { Label: "Voltage", ConfigName: "VoltageConfig"} },
        { ThrottlePositionConfig: { Label: "TPS", ConfigName: "ThrottlePositionConfig"} },
        { EthanolContentConfig: { Label: "Ethanol", ConfigName: "EthanolContentConfig"} },
        { VehicleSpeedConfig: { Label: "VSS", ConfigName: "VehicleSpeedConfig"} },
    ] },

    OutputServices: { Tabbed: true, Variables: [
        { IgnitorServices: { Label: "Ignitors", ConfigName: "IgnitorServicesConfig"} },
        { InjectorServices: { Label: "Injectors", ConfigName: "InjectorServicesConfig"} }
    ] },

    Main: { Tabbed: true, Variables: [
        { SensorServices: { Label: "Sensors", ConfigName: "SensorServices"} },
        { OutputServices: { Label: "Outputs", ConfigName: "OutputServices"} },
    ] }
};

for(var k in SensorServicesIni) {
    if(!EngineControlServicesIni[k]) {
        EngineControlServicesIni[k]=SensorServicesIni[k];
    }
}

for(var k in IOServicesIni) {
    if(!EngineControlServicesIni[k]) {
        EngineControlServicesIni[k]=IOServicesIni[k];
    }
}