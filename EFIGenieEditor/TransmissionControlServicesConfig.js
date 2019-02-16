var SensorServicesIni = {
    IntakeAirTemperatureConfig: [
        { IntakeAirTemperatureServiceId: { Type: "uint16", Value: 2002, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" }}
    ],
    EngineCoolantTemperatureServiceId: [
        { EngineCoolantTemperatureServiceId: { Type: "uint16", Value: 2003, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ],
    ManifoldAbsolutePressureServiceId: [
        { ManifoldAbsolutePressureServiceId: { Type: "uint16", Value: 2004, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ],
    VoltageConfig: [
        { VoltageServiceId: { Type: "uint16", Value: 2005, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ],
    ThrottlePositionConfig: [
        { ThrottlePositionServiceId: { Type: "uint16", Value: 2006, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ],
    EthanolContentConfig: [
        { EthanolContentServiceId: { Type: "uint16", Value: 2007, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ],
    VehicleSpeedConfig: [
        { VehicleSpeedServiceId: { Type: "uint16", Value: 2008, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ]
}

for(var k in IOServicesIni) 
    if(!SensorServicesIni[k])
        SensorServicesIni[k]=IOServicesIni[k];

var TransmissionControlServicesIni = {
    IShiftServiceConfig: [
        { IShiftServiceServiceId: { Type: "uint16", Value: 4009, Hidden: true } },
        { Selection: { Label: "Shift Service", Selections: [
            { Name: "Solenoid", ConfigName: "ShiftService_SolenoidConfig"}
        ] } }
    ],

    ShiftService_SolenoidConfig: [
        { ShiftService_SolenoidServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { Gears: { Type: "uint8", Label: "Gears", Value: 5, Min: 1, Max: 255, Step: 1 } },
        { Solenoids: { Type: "uint8", Label: "Solenoids", Value: 2, Min: 1, Max: 32, Step: 1 } },
        { SolenoidGearPositions: { Type: "uint32", Label: "Solenoid Gear Positions", XLabel: "Gear", ZLabel: "Solenoid Position", XResolution: "Gears", XMin: 1, XMax: "Gears", Dialog: true } },
        { SolenoidConfigs: { Label: "Solenoid Config", ConfigName: "IBooleanOutputServiceConfig", Array: "Solenoids"} }
    ],
    
    GearControlService_ButtonShiftConfig: [
        { GearControlService_ButtonShiftServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { ButtonUp: { Label: "Shift Up", ConfigName: "IButtonServiceConfig"} },
        { ButtonDown: { Label: "Shift Down", ConfigName: "IButtonServiceConfig"} }
    ],

    IGearControlServiceConfig: [
        { IGearControlServiceServiceId: { Type: "uint16", Value: 4010, Hidden: true } },
        { Selection: { Label: "Gear Control", Selections: [
            { Name: "Button Shift", ConfigName: "GearControlService_ButtonShiftConfig"}
        ] } }
    ],

    SimpleButtonControlConfig: [
        { ShiftService: { ConfigName: "IShiftServiceConfig"} },
        { GearControlService: { ConfigName: "IGearControlServiceConfig"} }
    ],

    Main: [
        { Selection: { Label: "Transmission Control", Selections: [
            { Name: "Simple Button Control", ConfigName: "SimpleButtonControlConfig"}
        ] } }
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