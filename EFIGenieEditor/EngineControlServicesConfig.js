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
    
    IdleAirControlValveConfig: { Variables: [
        { IdleAirControlValveServiceId: { Type: "uint16", Value: 3003, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatOutputServiceConfig" } }
    ] },

    IdleControlService_PidConfig: { Variables: [
        { IdleAirControlValveServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { TpsThreshold: { Label: "TPS Threshold", Type: "float", Value: 1, Units: PercentUnits } },
        { SpeedThreshold: { Label: "Speed Threshold", Type: "uint8", Value: 10, Units: SpeedUnits } },
        { P: { Label: "P", Type: "float", Value: 1 } },
        { I: { Label: "I", Type: "float", Value: 0 } },
        { D: { Label: "D", Type: "float", Value: 0 } },
        { MaxIntegral: { Label: "MaxIntegral", Type: "float", Value: 10 } },
        { MaxIntegral: { Label: "MinIntegral", Type: "float", Value: -10 } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1, Units: FrequencyUnits } },
        { GasConstant: { Label: "Gas Constant", Type: "uint16", Value: "//EngineGeneral/GasConstant", ValueMultiplier: 10, Hidden: true } },
        { MinEct: { Label: "Min Ect", Type: "int8", Value: 0, Units: TemperatureUnits } },
        { MaxEct: { Label: "Max Ect", Type: "int8", Value: 120, Units: TemperatureUnits } },
        { EctResolution: { Label: "Ect Resolution", Type: "uint8", Value: 16 } },
        { IdleAirmassPointer: { Type: "uint32", Hidden:true } },
        { IdleTargetRpmPointer: { Type: "uint32", Hidden:true } },
        { SpeedResolution: { Label: "Speed Resolution", Type: "uint8", Value: 16 } },
        { IdleAirmassSpeedAdderPointer: { Type: "uint32", Hidden:true } },
        { IdleTargetRpmSpeedAdderPointer: { Type: "uint32", Hidden:true } },
        { IdleAirmassTable: { Type: "float", XResolution: "EctResolution", Label: "ECT to Airmass", XLabel: "ECT", ZLabel: "Airmass", XMin: "MinEct", XMax: "MaxEct", Dialog: true, ZUnits: AirmassUnits, XUnits: TemperatureUnits } },
        { IdleTargetRpmTable: { Type: "uint16", XResolution: "EctResolution", Label: "ECT to Idle", XLabel: "ECT", ZLabel: "Idle Targe", XMin: "MinEct", XMax: "MaxEct", Dialog: true, ZUnits: RPMUnits, XUnits: TemperatureUnits } },
        { IdleAirmassSpeedAdderTable: { Type: "float", XResolution: "SpeedResolution", Label: "Speed to Airmass", XLabel: "Speed", ZLabel: "Airmass Add", XMin: 0, XMax: "SpeedThreshold", Dialog: true, ZUnits: AirmassUnits, XUnits: SpeedUnits } },
        { IdleTargetRpmSpeedAdder: { Type: "int16", XResolution: "SpeedResolution", Label: "Speed to Idle", XLabel: "Speed", ZLabel: "Idle Add", XMin: 0, XMax: "SpeedThreshold", Dialog: true, ZUnits: RPMUnits, XUnits: SpeedUnits } },
    ] },

    IIdleControlServiceConfig: { Variables: [
        { IdleAirControlValveServiceId: { Type: "uint16", Value: 4003, Hidden: true } },
        { Selection: { Label: "Idle Air Control Valve", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            { Name: "PID", ConfigName: "IdleControlService_PidConfig"}
        ] } }
    ] },

    SensorServices: { Tabbed: true, Variables: [
        { IntakeAirTemperatureConfig: { Label: "IAT", ConfigName: "IntakeAirTemperatureConfig", ValueUnits: TemperatureUnits } },
        { EngineCoolantTemperatureServiceConfig: { Label: "ECT", ConfigName: "EngineCoolantTemperatureServiceConfig", ValueUnits: TemperatureUnits } },
        { ManifoldAbsolutePressureServiceConfig: { Label: "MAP", ConfigName: "ManifoldAbsolutePressureServiceConfig", ValueUnits: PressureUnits} },
        { VoltageConfig: { Label: "Voltage", ConfigName: "VoltageConfig", ValueUnits: VoltUnits} },
        { ThrottlePositionConfig: { Label: "TPS", ConfigName: "ThrottlePositionConfig", ValueUnits: PercentUnits } },
        { EthanolContentConfig: { Label: "Ethanol", ConfigName: "EthanolContentConfig", ValueUnits: PercentUnits } },
        { VehicleSpeedConfig: { Label: "VSS", ConfigName: "VehicleSpeedConfig", ValueUnits: SpeedUnits} },
    ] },

    OutputServices: { Tabbed: true, Variables: [
        { IgnitorServices: { Label: "Ignitors", ConfigName: "IgnitorServicesConfig"} },
        { InjectorServices: { Label: "Injectors", ConfigName: "InjectorServicesConfig"} },
        { IdleAirControlValveService: { Label: "IAC Valve", ConfigName: "IdleAirControlValveConfig"} }
    ] },

    EngineGeneral: { Size: 0, Variables: [
        { GasConstant: { Label: "Gas Constant", Type: "variable", Value: 287.05, Units: GasConstantUnits } },
     ] },

    EngineServices: { Tabbed: true, Variables: [
        { EngineGeneral: { Label: "General", ConfigName: "EngineGeneral"} },
        { IdleControlService: { Label: "Idle", ConfigName: "IIdleControlServiceConfig"} }
    ] },

    BuilderConfig: { Tabbed: true, Variables: [
        { SensorServices: { Label: "Sensors", ConfigName: "SensorServices"} },
        { OutputServices: { Label: "Outputs", ConfigName: "OutputServices"} },
        { EngineServices: { Label: "Engine", ConfigName: "EngineServices"} },
    ] },

    Main: { Variables: [
        { BuilderConfig: { ConfigName: "BuilderConfig" } },
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