var SensorServicesIni = {
    IntakeAirTemperatureConfig: { Variables: [
        { IntakeAirTemperatureServiceId: { Type: "uint16", Value: 2002, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig", ValueUnits: TemperatureUnits }}
    ] },
    EngineCoolantTemperatureServiceConfig: { Variables: [
        { EngineCoolantTemperatureServiceId: { Type: "uint16", Value: 2003, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig", ValueUnits: TemperatureUnits } }
    ] },
    ManifoldAbsolutePressureServiceConfig: { Variables: [
        { ManifoldAbsolutePressureServiceId: { Type: "uint16", Value: 2004, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig", ValueUnits: PressureUnits } }
    ] },
    VoltageConfig: { Variables: [
        { VoltageServiceId: { Type: "uint16", Value: 2005, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig", ValueUnits: VoltUnits } }
    ] },
    ThrottlePositionConfig: { Variables: [
        { ThrottlePositionServiceId: { Type: "uint16", Value: 2006, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig", ValueUnits: PercentUnits } }
    ] },
    EthanolContentConfig: { Variables: [
        { EthanolContentServiceId: { Type: "uint16", Value: 2007, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig", ValueUnits: PercentUnits } }
    ] },
    VehicleSpeedConfig: { Variables: [
        { VehicleSpeedServiceId: { Type: "uint16", Value: 2008, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig", ValueUnits: SpeedUnits } }
    ] },
    ReluctorGM24x: { Variables: [
        { ReluctorGM24xServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } }
    ] },
    Reluctor2x: { Variables: [
        { ReluctorGM24xServiceId: { Type: "uint8", Value: 1, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { RisingPosition: { Type: "float", Label: "Rising Position", Units: DegreeUnits } },
        { FallingPosition: { Type: "float", Label: "Falling Position", Units: DegreeUnits } }
    ] },
    IReluctorConfig: { Variables: [
        { ReluctorServiceId: { Type: "uint16", Value: 2001, Hidden: true } },
        { Selection: { Label: "Reluctor", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig"},
            { Name: "GM24x", ConfigName: "ReluctorGM24x"},
            { Name: "2x", ConfigName: "Reluctor2x"}
        ] } }
    ] },
    CrankReluctorConfig: { Variables: [
        { CrankReluctorServiceId: { Type: "uint16", Value: 2009, Hidden: true } },
        { Reluctor: { ConfigName: "IReluctorConfig" } }
    ] },
    CamReluctorConfig: { Variables: [
        { CamReluctorServiceId: { Type: "uint16", Value: 2010, Hidden: true } },
        { Reluctor: { ConfigName: "IReluctorConfig" } }
    ] }
}

for(var k in IOServicesIni) 
    if(!SensorServicesIni[k])
        SensorServicesIni[k]=IOServicesIni[k];