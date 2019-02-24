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
    
    TachometerServiceConfig: { Variables: [
        { TachometerServiceId: { Type: "uint16", Value: 4001, Hidden: true } },
        { PulsesPer2Rpm: { Label: "Pulses Per RPM", Type: "uint8", Value: 1, ValueMultiplier: 2, Units: [ { Name:"Pulses/RPM", DisplayMultiplier: 1, DisplayOffset: 0} ] } },
        { BooleanOutputService: { ConfigName: "IBooleanOutputServiceConfig" } }
    ] },

    ITachometerServiceConfig: { Variables: [
        { Selection: { Label: "Tachometer Service", Selections: [
            { Name: "None", ConfigName: "BlankConfig"},
            { Name: "Pin", ConfigName: "TachometerServiceConfig"}
        ] } }
    ] },

    PrimeService_StaticPulseWidthConfig: { Variables: [
        { PulseWidth : { Label: "Pulse Width", Type: "float", Value: 0.1, Units: TimeUnits } }
    ] },
    
    IPrimeServiceConfig: { Variables: [
        { PrimeServiceId: { Type: "uint16", Value: 4002, Hidden: true } },
        { Selection: { Label: "Prime Service", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            { Name: "Static Pulse Width", ConfigName: "PrimeService_StaticPulseWidthConfig"}
        ] } }
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

    AfrService_StaticConfig: { Variables: [
        { PulseWidth : { Label: "AFR", Type: "float", Value: 14.7, Units: AfrUnits } }
    ] },

    AfrService_Map_EthanolConfig: { Variables: [
        { StartupAfrMultiplier : { Label: "Startup AFR Multiplier", Type: "float", Value: 1.1 } },
        { StartupAfrDelay : { Label: "Startup AFR Delay", Type: "float", Value: 10, Units: TimeUnits } },
        { StartupAfrDecay : { Label: "Startup AFR Decay", Type: "float", Value: 0.1, Units: PerSecond(BlankUnits) } },

        { MaxRpm : { Label: "Max RPM", Type: "uint16", Value: 7000, Units: RPMUnits } },
        { MaxMapBar : { Label: "Max MAP", Type: "float", Value: 1, Units: PressureUnits } },
        { AfrRpmResolution : { Label: "AFR RPM Resolution", Type: "uint8", Value: 8 } },
        { AfrMapResolution : { Label: "AFR MAP Resolution", Type: "uint8", Value: 8 } },
        { GasMapPointer : { Type: "uint32", Hidden: true } },
        { EthanolMapPointer : { Type: "uint32", Hidden: true } },
        
        { MaxEct : { Label: "Max ECT", Type: "int16", Value: 121, Units: TemperatureUnits } },
        { MinEct : { Label: "Min ECT", Type: "int16", Value: -40, Units: TemperatureUnits } },
        { AfrEctResolution : { Label: "AFR ECT Resolution", Type: "uint8", Value: 8 } },
        { EctMultiplierPointer : { Type: "uint32", Hidden: true } },
        
        { AfrTpsResolution : { Label: "AFR TPS Resolution", Type: "uint8", Value: 8 } },
        { TpsMinAfrGasPointer: { Type: "uint32", Hidden: true } },
        { TpsMinAfrEthanolPointer: { Type: "uint32", Hidden: true } },     
		
        { StoichResolution : { Label: "Stoich Resolution", Type: "uint8", Value: 8 } },
        { StoichPointer: { Type: "uint32", Hidden: true } },   
        
        { GasMap: { Type: "uint16", ValueMultiplier: 1/1024, XResolution: "AfrRpmResolution", YResolution: "AfrMapResolution", Label: "Gas AFR", XLabel: "RPM", ZLabel: "AFR", XMin: 0, XMax: "MaxRpm", YLabel: "MAP", YMin: 0, YMax: "MaxMapBar", XUnits: RPMUnits, YUnits: PressureUnits, ZUnits: AfrUnits, Dialog: true } },
        { EthanolMap: { Type: "uint16", ValueMultiplier: 1/1024, XResolution: "AfrRpmResolution", YResolution: "AfrMapResolution", Label: "Ethanol AFR", XLabel: "RPM", ZLabel: "AFR", XMin: 0, XMax: "MaxRpm", YLabel: "MAP", YMin: 0, YMax: "MaxMapBar", XUnits: RPMUnits, YUnits: PressureUnits, ZUnits: AfrUnits, Dialog: true } },
        { EctMultiplierTable: { Type: "uint8", ValueMultiplier: 1/255, XResolution: "AfrEctResolution", Label: "ECT Multiplier", XLabel: "ECT", ZLabel: "Multiplier", XMin: "MinEct", XMax: "MaxEct", XUnits: TemperatureUnits, ZUnits: BlankUnits, Dialog: true } },
        { TpsMaxAfrGas: { Type: "uint16", ValueMultiplier: 1/1024, XResolution: "AfrTpsResolution", Label: "Max AFR Gas", XLabel: "TPS", ZLabel: "AFR", XMin: 0, XMax: 1, XUnits: PercentUnits, ZUnits: AfrUnits, Dialog: true } },
        { TpsMaxAfrEthanol: { Type: "uint16", ValueMultiplier: 1/1024, XResolution: "AfrTpsResolution", Label: "Max AFR Ethanol", XLabel: "TPS", ZLabel: "AFR", XMin: 0, XMax: 1, XUnits: PercentUnits, ZUnits: AfrUnits, Dialog: true } },
        { StoichTable: { Type: "uint16", ValueMultiplier: 1/1024, XResolution: "StoichResolution", Label: "Stoich", XLabel: "Ethanol Content", ZLabel: "AFR", XMin: 0, XMax: 1, XUnits: PercentUnits, ZUnits: AfrUnits, Dialog: true } },
    ] },
    
    IAfrServiceConfig: { Variables: [
        { AfrServiceId: { Type: "uint16", Value: 4004, Hidden: true } },
        { Selection: { Label: "AFR Service", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            { Name: "Static", ConfigName: "AfrService_StaticConfig"},
            { Name: "MAP + Ethanol", ConfigName: "AfrService_Map_EthanolConfig"}
        ] } }
    ] },
    
    IFuelTrimServiceConfig: { Variables: [
        { FuelTrimServiceId: { Type: "uint16", Value: 4005, Hidden: true } },
        { Selection: { Label: "Fuel Trim Service", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            //{ Name: "Table", ConfigName: ""},
            //{ Name: "Multi Channel", ConfigName: ""}
        ] } }
    ] },
    
    IFuelPumpServiceConfig: { Variables: [
        { FuelPumpServiceId: { Type: "uint16", Value: 4006, Hidden: true } },
        { Selection: { Label: "Fuel Pump Service", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            //{ Name: "Pin", ConfigName: ""},
            //{ Name: "Analog", ConfigName: ""}
        ] } }
    ] },
    
    IgnitionSchedulingService: { Variables: [
        { IgnitionSchedulingServiceId: { Type: "uint16", Value: 4007, Hidden: true } },
    ] },

    IIgnitionSchedulingService: { Variables: [
        { Selection: { Label: "Ignition Scheduling Service", Selections: [
            { Name: "None", ConfigName: "BlankConfig"},
            { Name: "Schedule", ConfigName: "IgnitionSchedulingService"}
        ] } }
    ] },
    
    InjectionSchedulingService: { Variables: [
        { InjectionSchedulingServiceId: { Type: "uint16", Value: 4008, Hidden: true } },
    ] },

    IInjectionSchedulingService: { Variables: [
        { Selection: { Label: "Injection Scheduling Service", Selections: [
            { Name: "None", ConfigName: "BlankConfig"},
            { Name: "Schedule", ConfigName: "InjectionSchedulingService"}
        ] } }
    ] },

    SensorServices: { Tabbed: true, Variables: [
        { DecoderConfig: { Label: "Crank/Cam Decoder", ConfigName: "DecoderConfig" } },
        { IntakeAirTemperatureConfig: { Label: "IAT", ConfigName: "IntakeAirTemperatureConfig" } },
        { EngineCoolantTemperatureServiceConfig: { Label: "ECT", ConfigName: "EngineCoolantTemperatureServiceConfig" } },
        { ManifoldAbsolutePressureServiceConfig: { Label: "MAP", ConfigName: "ManifoldAbsolutePressureServiceConfig" } },
        { VoltageConfig: { Label: "Voltage", ConfigName: "VoltageConfig" } },
        { ThrottlePositionConfig: { Label: "TPS", ConfigName: "ThrottlePositionConfig" } },
        { EthanolContentConfig: { Label: "Ethanol", ConfigName: "EthanolContentConfig" } },
        { VehicleSpeedConfig: { Label: "VSS", ConfigName: "VehicleSpeedConfig" } },
    ] },

    OutputServices: { Tabbed: true, Variables: [
        { IgnitorServices: { Label: "Ignitors", ConfigName: "IgnitorServicesConfig"} },
        { InjectorServices: { Label: "Injectors", ConfigName: "InjectorServicesConfig"} },
        { IdleAirControlValveService: { Label: "IAC Valve", ConfigName: "IdleAirControlValveConfig"} },
        { TachometerService: { Label: "Tach", ConfigName: "ITachometerServiceConfig"} }
    ] },

    EngineGeneral: { Size: 0, Variables: [
        { GasConstant: { Label: "Gas Constant", Type: "variable", Value: 287.05, Units: GasConstantUnits } },
     ] },

    EngineServices: { Tabbed: true, Variables: [
        { EngineGeneral: { Label: "General", ConfigName: "EngineGeneral"} },
        { IdleControlService: { Label: "Idle", ConfigName: "IIdleControlServiceConfig"} },
        { PrimeService: { Label: "Prime", ConfigName: "IPrimeServiceConfig"} },
        { AfrService: { Label: "AFR", ConfigName: "IAfrServiceConfig"} },
        { FuelTrimService: { Label: "Fuel Trim", ConfigName: "IFuelTrimServiceConfig"} },
        { FuelPumpService: { Label: "Fuel Pump", ConfigName: "IFuelPumpServiceConfig"} },
        { IgnitionSchedulingService: { Label: "Ignition", ConfigName: "IIgnitionSchedulingService"} },
        { InjectionSchedulingService: { Label: "Injection", ConfigName: "IInjectionSchedulingService"} }
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