var EngineControlServicesIni = {
    IgnitorServicesConfig: { Variables: [
        { IgnitorServicesId: { Type: "uint16", Value: 3001, Hidden: true } },
        { Coils: { Type: "uint8", Label: "Ignition Coils", Value: 8, Min: 0, Max: 16, Step: 1 } },
        { CoilConfigs: { 
            Label: "Coil",
            Labels: ["Coil 1", "Coil 2", "Coil 3", "Coil 4", "Coil 5", "Coil 6", "Coil 7", "Coil 8", "Coil 9", "Coil 10", "Coil 11", "Coil 12", "Coil 13", "Coil 14", "Coil 15", "Coil 16"], 
            ConfigName: "IBooleanOutputServiceConfig", 
            Array: "Coils"
        } }
    ] },

    InjectorServicesConfig: { Variables: [
        { InjectorServicesId: { Type: "uint16", Value: 3002, Hidden: true } },
        { Injectors: { Type: "uint8", Label: "Injectors", Value: 8, Min: 0, Max: 32, Step: 1 } },
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
        { PrimeService_StaticPulseWidthServiceId: { Type: "uint8", Value: 1, Hidden: true } },
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
        { IdleControlService_PidConfigServiceId: { Type: "uint8", Value: 1, Hidden: true } },
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
        { Selection: { Label: "Idle Control", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            { Name: "PID", ConfigName: "IdleControlService_PidConfig"}
        ] } }
    ] },    

    AfrService_StaticConfig: { Variables: [
        { AfrService_StaticServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { PulseWidth : { Label: "AFR", Type: "float", Value: 14.7, Units: AfrUnits } }
    ] },

    AfrService_Map_EthanolConfig: { Variables: [
        { AfrService_Map_EthanolServiceId: { Type: "uint8", Value: 1, Hidden: true } },
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

    FuelTrimService_InterpolatedTableConfig: { Variables: [
        { FuelTrimService_InterpolatedTableServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { UpdateRate : { Label: "Update Rate", Type: "uint16", Value: 1000, Min: 1, Units: FrequencyUnits } },
        { CycleDelay : { Label: "Cycle Delay", Type: "uint16", Value: 1, Min: 0, Units: CycleUnits } },
        { P: { Label: "P", Type: "float", Value: 1 } },
        { I: { Label: "I", Type: "float", Value: 0 } },
        { D: { Label: "D", Type: "float", Value: 0 } },

        { RpmResolution : { Label: "RPM Resolution", Type: "uint8", Value: 3, Min: 1 } },
        { RpmDivisionsPointer: { Type: "uint32", Hidden:true } },
        { RpmInterpolationDistance : { Label: "RPM Interpolation Distance", Type: "uint16", Value: 700, Min: 0, Units: RPMUnits } },
        { UseTps: { Label: "Y Source", Type: "uint8", Value: 0, Selections: [ "MAP", "TPS" ] } },
        
        { YResolution : { Label: "Y Resolution", Type: "uint8", Value: 3, Min: 1 } },
        { YDivisionsPointer: { Type: "uint32", Hidden:true } },
        { YInterpolationDistance : { Label: "Y Interpolation Distance", Type: "float", Value: 0.1, Min: 0, Units: PressureUnits } },

        { IsPid: { Type: "bool", Label: "PID" } },
        { LambdaDeltaEnable : { Label: "Lamda Delta Enable", Type: "float", Value: 0.04, Min: 0, Units: LambdaUnits } },
        
        { RpmDivisions: { Type: "uint16", XResolution: "RpmResolution", Label: "RPM Divisions", XLabel: "Division", ZLabel: "RPM", XMin: 1, XMax: "RpmResolution", ZUnits: RPMUnits, Dialog: true } },
        { YDivisions: { Type: "float", XResolution: "YResolution", Label: "Y Divisions", XLabel: "Division", ZLabel: "Y", XMin: 1, XMax: "YResolution", ZUnits: PressureUnits, Dialog: true } },
        
        { LamdaSensor: { ConfigName: "IFloatInputServiceConfig", ValueUnits: LambdaUnits } }
    ] },
    
    FuelTrimServiceWrapper_MultiChannelConfig: { Variables: [
        { FuelTrimService_InterpolatedTableServiceId: { Type: "uint8", Value: 2, Max: 16, Hidden: true } },
        { NumberOfFuelTrimChannels : { Label: "Channels", Type: "uint8", Value: 2, Min: 1 } },
        { FuelTrimChannelMask: { Type: "uint16", XResolution: "NumberOfFuelTrimChannels", Label: "Channel Cylinder Mask", XLabel: "Channel", ZLabel: "Cylinder Mask", XMin: 1, XMax: "NumberOfFuelTrimChannels", Dialog: true } },
        { ChannelConfigs: { 
            Label: "Channel",
            Labels: ["Channel 1", "Channel 2", "Channel 3", "Channel 4", "Channel 5", "Channel 6", "Channel 7", "Channel 8", "Channel 9", "Channel 10", "Channel 11", "Channel 12", "Channel 13", "Channel 14", "Channel 15", "Channel 16"], 
            ConfigName: "IFuelTrimServiceConfig", 
            Array: "NumberOfFuelTrimChannels"
        } }
    ] },
    
    IFuelTrimServiceConfig: { Variables: [
        { FuelTrimServiceId: { Type: "uint16", Value: 4005, Hidden: true } },
        { Selection: { Label: "Fuel Trim Service", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            { Name: "Table", ConfigName: "FuelTrimService_InterpolatedTableConfig"},
            { Name: "Multi Channel", ConfigName: "FuelTrimServiceWrapper_MultiChannelConfig"}
        ] } }
    ] },
    
    FuelPumpServiceConfig: { Variables: [
        { FuelPumpServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { PrimeTime : { Label: "Prime Time", Type: "float", Value: 3, Units: TimeUnits } },
        
        { BooleanOutputService: { ConfigName: "IBooleanOutputServiceConfig" } }
    ] },
    
    FuelPumpService_AnalogConfig: { Variables: [
        { FuelPumpServiceId: { Type: "uint8", Value: 2, Hidden: true } },
        { PrimeValue : { Label: "Prime Value", Type: "float", Value: 3, Units: PressureUnits } },
        { PrimeTime : { Label: "Prime Time", Type: "float", Value: 3, Units: TimeUnits } },
			
        { UseTps: { Label: "Y Source", Type: "uint8", Value: 0, Selections: [ "MAP", "TPS" ] } },
		
        { MaxRpm : { Label: "Max RPM", Type: "uint16", Value: 7000, Units: RPMUnits } },
        { MaxY : { Label: "Max Y", Type: "float", Value: 1, Units: PressureUnits } },
        { RpmResolution : { Label: "RPM Resolution", Type: "uint8", Value: 4, Min: 1 } },
        { YResolution : { Label: "Y Resolution", Type: "uint8", Value: 4, Min: 1 } },
        { AnalogTablePointer: { Type: "uint32", Hidden:true } },

        { AnalogTable: { Type: "float", XResolution: "RpmResolution", YResolution: "YResolution", Label: "Table", XLabel: "RPM", ZLabel: "Pressure", XMin: 0, XMax: "MaxRpm", YLabel: "MAP", YMin: 0, YMax: "MaxY", XUnits: RPMUnits, YUnits: PressureUnits, ZUnits: PressureUnits, Dialog: true } },
        
        { AnalogOutputService: { ConfigName: "IFloatOutputServiceConfig", ValueUnits: PressureUnits } }
    ] },
    
    IFuelPumpServiceConfig: { Variables: [
        { FuelPumpServiceId: { Type: "uint16", Value: 4006, Hidden: true } },
        { Selection: { Label: "Fuel Pump Service", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            { Name: "Pin", ConfigName: "FuelPumpServiceConfig"},
            { Name: "Analog", ConfigName: "FuelPumpService_AnalogConfig"}
        ] } }
    ] },
    
    IgnitionConfig_StaticConfig: { Variables: [
        { IgnitionConfig_StaticConfigId: { Type: "uint8", Value: 1, Hidden: true } },
        { IgnitionDwellTime : { Label: "Dwell Time", Type: "float", Value: 0.0035, Units: TimeUnits } },
        { IgnitionAdvance64thDegree : { Label: "Advance", Type: "int16", ValueMultiplier: 1/64, Value: 10, Units: DegreeUnits } }
    ] },

    IgnitionConfig_Map_EthanolConfig: { Variables: [
        { IgnitionConfig_Map_EthanolConfigId: { Type: "uint8", Value: 2, Hidden: true } },
        { MaxRpm : { Label: "Max RPM", Type: "uint16", Value: 7000, Units: RPMUnits } },
        { MaxMapBar : { Label: "Max MAP", Type: "float", Value: 1, Units: PressureUnits } },
        { IgnitionRpmResolution : { Label: "Advance RPM Resolution", Type: "uint8", Value: 8 } },
        { IgnitionMapResolution : { Label: "Advance MAP Resolution", Type: "uint8", Value: 8 } },
        { GasMapPointer : { Type: "uint32", Hidden: true } },
        { EthanolMapPointer : { Type: "uint32", Hidden: true } },
        { GasMap: { Type: "int16", ValueMultiplier: 1/64, XResolution: "IgnitionRpmResolution", YResolution: "IgnitionMapResolution", Label: "Gas Advance", XLabel: "RPM", ZLabel: "Advance", XMin: 0, XMax: "MaxRpm", YLabel: "MAP", YMin: 0, YMax: "MaxMapBar", XUnits: RPMUnits, YUnits: PressureUnits, ZUnits: DegreeUnits, Dialog: true } },
        { EthanolMap: { Type: "int16", ValueMultiplier: 1/64, XResolution: "IgnitionRpmResolution", YResolution: "IgnitionMapResolution", Label: "Ethanol Advance", XLabel: "RPM", ZLabel: "Advance", XMin: 0, XMax: "MaxRpm", YLabel: "MAP", YMin: 0, YMax: "MaxMapBar", XUnits: RPMUnits, YUnits: PressureUnits, ZUnits: DegreeUnits, Dialog: true } },
    ] },
    
    IgnitionConfigWrapper_HardRpmLimitConfig:  { Variables: [
        { IgnitionConfigWrapper_HardRpmLimitConfigId: { Type: "uint8", Value: 3, Hidden: true } },
        { RpmEnable : { Label: "RPM Enable", Type: "uint16", Value: 6450, Units: RPMUnits } },
        { RpmDisable : { Label: "RPM Disable", Type: "uint16", Value: 6500, Units: RPMUnits } },
        { BooleanInput: { ConfigName: "IBooleanInputServiceConfig" } },
        { IgnitionConfig: { ConfigName: "IIgnitionConfig" } }
    ] },

    IgnitionConfigWrapper_SoftPidRpmLimitConfig:  { Variables: [
        { IgnitionConfigWrapper_SoftPidRpmLimitConfigId: { Type: "uint8", Value: 3, Hidden: true } },
        { RpmStart : { Label: "RPM Start", Type: "uint16", Value: 6450, Units: RPMUnits } },
        { RpmLimit : { Label: "RPM Limit", Type: "uint16", Value: 6500, Units: RPMUnits } },
        { P: { Label: "P", Type: "float", Value: 1 } },
        { I: { Label: "I", Type: "float", Value: 0 } },
        { D: { Label: "D", Type: "float", Value: 0 } },
        { BooleanInput: { ConfigName: "IBooleanInputServiceConfig" } },
        { IgnitionConfig: { ConfigName: "IIgnitionConfig" } }
    ] },

    IIgnitionConfig: { Variables: [
        { Selection: { Label: "Ignition Config", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            { Name: "Static", ConfigName: "IgnitionConfig_StaticConfig"},
            { Name: "MAP + Ethanol", ConfigName: "IgnitionConfig_Map_EthanolConfig"},
            { Name: "RPM Limit Wrapper (Hard)", ConfigName: "IgnitionConfigWrapper_HardRpmLimitConfig"},
            { Name: "RPM Limit Wrapper (Soft PID)", ConfigName: "IgnitionConfigWrapper_SoftPidRpmLimitConfig"}
        ] } }
    ] },
    
    IgnitionSchedulingService: { Variables: [
        { IgnitionSchedulingServiceId: { Type: "uint16", Value: 4007, Hidden: true } },
        { SequentialRequired: { Type: "bool", Label: "Sequential Required" } },
        { Ignitors: { Type: "uint8", Value: "//IgnitorServices/Coils", Hidden: true } },
        { IgnitorTdcPointer : { Type: "uint32", Hidden: true } },
		{ IgnitorTdc: { Type: "uint16", XResolution: "//IgnitorServices/Coils", Label: "Coil TDC", XLabel: "Coil", ZLabel: "TDC", XMin: 1, XMax: "//IgnitorServices/Coils", ZUnits: DegreeUnits, Dialog: true } },
        
        { IgnitionConfig: { ConfigName: "IIgnitionConfig" } }
    ] },

    IIgnitionSchedulingService: { Variables: [
        { Selection: { Label: "Ignition Scheduling Service", Selections: [
            { Name: "None", ConfigName: "BlankConfig"},
            { Name: "Schedule", ConfigName: "IgnitionSchedulingService"}
        ] } }
    ] },
    
    InjectionConfig_SDConfig: { Variables: [
        { InjectionConfig_SDConfigId: { Type: "uint8", Value: 2, Hidden: true } },
        { GasConstant: { Label: "Gas Constant", Type: "uint16", Value: "//EngineGeneral/GasConstant", ValueMultiplier: 10, Hidden: true } },
        { Ml8thPerCylinder: { Label: "Cylinder Volume", Type: "uint16", Value: "//EngineGeneral/CylinderVolume", ValueMultiplier: 8000, Hidden: true } },
        { InjectorOpenPosition64thDegree: { Label: "Injector Open Position", Type: "uint16", Value: 330, ValueMultiplier: 64, Units: DegreeUnits } },

        { MaxRpm: { Label: "Max RPM", Type: "uint16", Value: 7000, Units: RPMUnits } },
        { MaxMapBar: { Label: "Max MAP", Type: "float", Value: 1, Units: PressureUnits } },
        { VeRpmResolution: { Label: "VE RPM Resolution", Type: "uint8", Value: 8 } },
        { VeMapResolution: { Label: "VE MAP Resolution", Type: "uint8", Value: 8 } },
        { VolumetricEfficiencyMapPointer: { Type: "uint32", Hidden: true } },

        { Injectors: { Type: "uint8", Value: "//InjectorServices/Injectors", Hidden: true } },
        { InjectorGramsPerMinutePointer : { Type: "uint32", Hidden: true } },
		
        { ShortPulseLimit: { Label: "Short Pulse Limit", Type: "float", Value: 0.1, Units: TimeUnits } },
        { ShortPulseAdderResolution: { Label: "Short Pulse Resolution", Type: "uint8", Value: 17 } },
        { ShortPulseAdderPointer: { Type: "uint32", Hidden: true } },

        { VoltageMax: { Label: "Voltage Max", Type: "float", Value: 16, Units: VoltUnits } },
        { VoltageMin: { Label: "Voltage Min", Type: "float", Value: 8, Units: VoltUnits } },
        { OffsetMapResolution: { Label: "VE RPM Resolution", Type: "uint8", Value: 8 } },
        { OffsetVoltageResolution: { Label: "VE MAP Resolution", Type: "uint8", Value: 8 } },
        { OffsetPointer: { Type: "uint32", Hidden: true } },

        { TemperatureBiasResolution: { Label: "Temperature Resolution", Type: "uint8", Value: 8 } },
        { MaxTemperatureBias: { Label: "Tempurature Bias Max Airflow", Type: "float", Value: 4000000, Units: FlowUnits } },
        { TemperatureBiasPointer: { Type: "uint32", Hidden: true } },

        { MaxTpsDot: { Label: "Max TPS Dot", Type: "float", Value: 5, Units: PerSecond(PercentUnits) } },
        { TpsDotAdderResolution: { Label: "TPS Dot Resolution", Type: "uint8", Value: 8 } },
        { TpsDotAdderPointer: { Type: "uint32", Hidden: true } },

        { MaxMapDot: { Label: "Max MAP Dot", Type: "float", Value: 5, Units: PerSecond(PressureUnits) } },
        { MapDotAdderResolution: { Label: "MAP Dot Resolution", Type: "uint8", Value: 8 } },
        { MapDotAdderPointer: { Type: "uint32", Hidden: true } },


        { VolumetricEfficiencyMap: { Type: "uint16", ValueMultiplier: 1/8192, XResolution: "VeRpmResolution", YResolution: "VeMapResolution", Label: "Volumetric Efficiency", XLabel: "RPM", ZLabel: "VE", XMin: 0, XMax: "MaxRpm", YLabel: "MAP", YMin: 0, YMax: "MaxMapBar", XUnits: RPMUnits, YUnits: PressureUnits, ZUnits: PercentUnits, Dialog: true } },
        { InjectorGramsPerMinute: { Type: "uint16", XResolution: "//InjectorServices/Injectors", Label: "Injector Flow", XLabel: "Injector", ZLabel: "Injector Flow", XMin: 1, XMax: "//InjectorServices/Injectors", ZUnits: FlowUnits, Dialog: true } },
        { ShortPulseAdder: { Type: "short16", ValueMultiplier: 1000000, XResolution: "ShortPulseAdderResolution", Label: "Short Pulse Adder", XLabel: "Short Pulse", ZLabel: "Pulse Width", XMin: 0, XMax: "ShortPulseLimit", XUnits: TimeUnits, ZUnits: TimeUnits, Dialog: true } },
        { Offset: { Type: "uint16", ValueMultiplier: 1000000, XResolution: "OffsetVoltageResolution", YResolution: "OffsetMapResolution", Label: "Injector Offset", XLabel: "Voltage", ZLabel: "Offset", XMin: "VoltageMin", XMax: "VoltageMax", YLabel: "MAP", YMin: 0, YMax: "MaxMapBar", XUnits: VoltUnits, YUnits: PressureUnits, ZUnits: TimeUnits, Dialog: true } },
        { TemperatureBias: { Type: "uint8", ValueMultiplier: 1/255, XResolution: "TemperatureBiasResolution", Label: "Temperature Bias IAT:ECT", XLabel: "Airflow/Cylinder", ZLabel: "Temperature Bias", XMin: 0, XMax: "MaxTemperatureBias", XUnits: FlowUnits, Dialog: true } },
        { TpsDotAdder: { Type: "short16", ValueMultiplier: 1000000, XResolution: "TpsDotAdderResolution", Label: "TPS Dot Adder", XLabel: "TPS Dot", ZLabel: "Pulse Width", XMin: 0, XMax: "MaxTpsDot", XUnits: PercentUnits, ZUnits: TimeUnits, Dialog: true } },
        { MapDotAdder: { Type: "short16", ValueMultiplier: 1000000, XResolution: "MapDotAdderResolution", Label: "MAP Dot Adder", XLabel: "MAP Dot", ZLabel: "Pulse Width", XMin: 0, XMax: "MaxMapDot", XUnits: PressureUnits, ZUnits: TimeUnits, Dialog: true } },
    ] },

    InjectionConfigWrapper_DFCOConfig:  { Variables: [
        { InjectionConfigWrapper_DFCOConfigId: { Type: "uint16", Value: 3, Hidden: true } },
        { TpsThreshold : { Label: "TPS Threshold", Type: "float", Value: 0.03, Units: PercentUnits } },
        { RpmEnable : { Label: "RPM Enable", Type: "uint16", Value: 1500, Units: RPMUnits } },
        { RpmDisable : { Label: "RPM Disable", Type: "uint16", Value: 1200, Units: RPMUnits } },
        
        { InjectionConfig: { ConfigName: "IInjectionConfig" } }
    ] },
    
    IInjectionConfig: { Variables: [
        { Selection: { Label: "Injection Config", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            { Name: "Speed Density", ConfigName: "InjectionConfig_SDConfig"},
            { Name: "DFCO Wrapper", ConfigName: "InjectionConfigWrapper_DFCOConfig"}
        ] } }
    ] },

    InjectionSchedulingService: { Variables: [
        { InjectionSchedulingServiceId: { Type: "uint16", Value: 4008, Hidden: true } },
		{ Injectors: { Type: "uint8", Value: "//InjectorServices/Injectors", Hidden: true } },
		{ InjectorTdc: { Type: "uint16", XResolution: "//InjectorServices/Injectors", Label: "Injector TDC", XLabel: "Injector", ZLabel: "TDC", XMin: 1, XMax: "//InjectorServices/Injectors", ZUnits: DegreeUnits, Dialog: true } },
        
        { InjectionConfig: { ConfigName: "IInjectionConfig" } }
    ] },

    IInjectionSchedulingService: { Variables: [
        { Selection: { Label: "Injection Scheduling Service", Selections: [
            { Name: "None", ConfigName: "BlankConfig"},
            { Name: "Schedule", ConfigName: "InjectionSchedulingService"}
        ] } }
    ] },

    SensorServices: { Tabbed: true, Variables: [
        { DecoderConfig: { Label: "Crank/Cam Decoder", ConfigName: "IDecoderConfig" } },
        { IntakeAirTemperatureConfig: { Label: "IAT", ConfigName: "IntakeAirTemperatureConfig" } },
        { EngineCoolantTemperatureServiceConfig: { Label: "ECT", ConfigName: "EngineCoolantTemperatureServiceConfig" } },
        { ManifoldAbsolutePressureServiceConfig: { Label: "MAP", ConfigName: "ManifoldAbsolutePressureServiceConfig" } },
        { VoltageConfig: { Label: "Voltage", ConfigName: "VoltageConfig" } },
        { ThrottlePositionConfig: { Label: "TPS", ConfigName: "ThrottlePositionConfig" } },
        { EthanolContentConfig: { Label: "Ethanol", ConfigName: "EthanolContentConfig" } },
        { VehicleSpeedConfig: { Label: "VSS", ConfigName: "VehicleSpeedConfig" } },
    ] },

    OutputServices: { Tabbed: true, Variables: [
        { IgnitorServices: { Label: "Ignition Coils", ConfigName: "IgnitorServicesConfig"} },
        { InjectorServices: { Label: "Injectors", ConfigName: "InjectorServicesConfig"} },
        { IdleAirControlValveService: { Label: "IAC Valve", ConfigName: "IdleAirControlValveConfig"} },
        { TachometerService: { Label: "Tach", ConfigName: "ITachometerServiceConfig"} }
    ] },

    EngineGeneral: { Size: 0, Variables: [
        { GasConstant: { Label: "Gas Constant", Type: "variable", Value: 287.05, Units: GasConstantUnits } },
        { CylinderVolume:  { Label: "Cylinder Volume", Type: "variable", Value: 0.66594, Units: VolumeUnits } }
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

    EngineBuilderConfig: { Tabbed: true, Variables: [
        { SensorServices: { Label: "Sensors", ConfigName: "SensorServices"} },
        { OutputServices: { Label: "Outputs", ConfigName: "OutputServices"} },
        { EngineServices: { Label: "Engine", ConfigName: "EngineServices"} },
        { TransmissionServices: { Label: "Tranmission", ConfigName: "TransmissionServices"} },
    ] },

    Main: { Variables: [
        { BuilderConfig: { ConfigName: "EngineBuilderConfig" } },
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

for(var k in TransmissionControlServicesIni) {
    if(!EngineControlServicesIni[k]) {
        EngineControlServicesIni[k]=TransmissionControlServicesIni[k];
    }
}