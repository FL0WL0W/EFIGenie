var SensorServicesIni = {
    IntakeAirTemperatureConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 2002 },
        { Location: "FloatInputService", Ini: "IFloatInputServiceConfig" }
    ],
    EngineCoolantTemperatureConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 2003 },
        { Location: "FloatInputService", Ini: "IFloatInputServiceConfig" }
    ],
    ManifoldAbsolutePressureConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 2004 },
        { Location: "FloatInputService", Ini: "IFloatInputServiceConfig" }
    ],
    VoltageConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 2005 },
        { Location: "FloatInputService", Ini: "IFloatInputServiceConfig" }
    ],
    ThrottlePositionConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 2006 },
        { Location: "FloatInputService", Ini: "IFloatInputServiceConfig" }
    ],
    EthanolContentConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 2007 },
        { Location: "FloatInputService", Ini: "IFloatInputServiceConfig" }
    ],
    VehicleSpeedConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 2008 },
        { Location: "FloatInputService", Ini: "IFloatInputServiceConfig" }
    ]
}

for(var k in IOServicesIni) 
    if(!SensorServicesIni[k])
        SensorServicesIni[k]=IOServicesIni[k];

var TransmissionControlServicesIni = {
    IShiftServiceConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 4009 },
        { Location: "Selection", Type: "iniselection", Label: "Shift Service", DefaultValue: {Index: 0}, WrapInConfigContainer: false, Selections: [
            { Name: "Solenoid", Ini: "ShiftService_SolenoidConfig"}
        ] }
    ],

    ShiftService_SolenoidConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 1 },
        { Location: "Gears", Type: "uint8", Label: "Gears", DefaultValue: 0, Min: 1, Max: 255, Step: 1 },
        { Location: "Solenoids", Type: "uint8", Label: "Solenoids", DefaultValue: 0, Min: 1, Max: 32, Step: 1 },
        { Location: "SolenoidGearPositions", Type: "uint32[Gears]", Label: "Solenoid Gear Positions", XLabel: "Gear", ZLabel: "Solenoid Position", DefaultValue: 0, Min: 0, Max: 4294967295, Step: 1, XMin: "1", XMax: "Gears", Dialog: true },
        { Location: "SolenoidConfigs", Label: "Solenoid Configs", Ini: "BooleanOutputServiceConfig[Solenoids]"}
    ],
    
    GearControlService_ButtonShiftConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 1 },
        { Location: "ButtonUp", Label: "Shift Up", Ini: "IButtonServiceConfig"},
        { Location: "ButtonDown", Label: "Shift Down", Ini: "IButtonServiceConfig"}
    ],

    IGearControlServiceConfig: [
        { Location: "static", Type: "uint8", DefaultValue: 4010 },
        { Location: "Selection", Type: "iniselection", Label: "Gear Control", DefaultValue: {Index: 0}, WrapInConfigContainer: false, Selections: [
            { Name: "Button Shift", Ini: "GearControlService_ButtonShiftConfig"}
        ] }
    ],

    SimpleButtonControlConfig: [
        { Location: "ShiftService", Ini: "IShiftServiceConfig"},
        { Location: "GearControlService", Ini: "IGearControlServiceConfig"}
    ],

    Main: [
        { Location: "Selection", Type: "iniselection", Label: "Gear Control", DefaultValue: {Index: 0}, WrapInConfigContainer: false, Selections: [
            { Name: "Simple Button Control", Ini: "SimpleButtonControlConfig"}
        ] }
    ],
};

for(var k in SensorServicesIni) {
    if(!TransmissionControlServicesIni[k]) {
        TransmissionControlServicesIni[k]=SensorServicesIni[k];
    }
}

for(var k in IOServicesIni) {
    if(!TransmissionControlServicesIni[k]) {
        TransmissionControlServicesIni[k]=IOServicesIni[k];
    }
}