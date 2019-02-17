var TransmissionControlServicesIni = {
    IShiftServiceConfig: [
        { IShiftServiceServiceId: { Type: "uint16", Value: 4009, Hidden: true } },
        { Selection: { Label: "Shift Service", Selections: [
            { Name: "None", ConfigName: "NoneConfig"},
            { Name: "Solenoid", ConfigName: "ShiftService_SolenoidConfig"}
        ] } }
    ],

    ShiftService_SolenoidConfig: [
        { ShiftService_SolenoidServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { Gears: { Type: "uint8", Label: "Gears", Value: 5, Min: 1, Max: 255, Step: 1 } },
        { Solenoids: { Type: "uint8", Label: "Solenoids", Value: 2, Min: 1, Max: 32, Step: 1 } },
        { SolenoidGearPositions: { Type: "uint32", Label: "Solenoid Gear Positions", XLabel: "Gear", ZLabel: "Solenoid Position", XResolution: "Gears", XMin: 1, XMax: "Gears", Dialog: true } },
        { SolenoidConfigs: { 
            Label: "Solenoid",
            Labels: ["Solenoid A", "Solenoid B", "Solenoid C", "Solenoid D", "Solenoid E", "Solenoid F", "Solenoid G", "Solenoid H", "Solenoid I", "Solenoid J", "Solenoid K", "Solenoid L", "Solenoid M", "Solenoid N", "Solenoid O", "Solenoid P"], 
            ConfigName: "IBooleanOutputServiceConfig", 
            Array: "Solenoids"
        } }
    ],
    
    GearControlService_ButtonShiftConfig: [
        { GearControlService_ButtonShiftServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { ButtonUp: { Label: "Shift Up", ConfigName: "IButtonServiceConfig"} },
        { ButtonDown: { Label: "Shift Down", ConfigName: "IButtonServiceConfig"} }
    ],

    IGearControlServiceConfig: [
        { IGearControlServiceServiceId: { Type: "uint16", Value: 4010, Hidden: true } },
        { Selection: { Label: "Gear Control", Selections: [
            { Name: "None", ConfigName: "NoneConfig"},
            { Name: "Button Shift", ConfigName: "GearControlService_ButtonShiftConfig"}
        ] } }
    ],

    SimpleButtonControlConfig: [
        { ShiftService: { ConfigName: "ShiftService_SolenoidConfig"} },
        { GearControlService: { ConfigName: "GearControlService_ButtonShiftConfig"} }
    ],

    Main: [
        { Selection: { Label: "Transmission Control", Selections: [
            { Name: "None", ConfigName: "BlankConfig"},
            { Name: "Simple Button Control", ConfigName: "SimpleButtonControlConfig"}
        ] } }
    ]
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