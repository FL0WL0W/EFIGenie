var SensorServicesIni = {
    IntakeAirTemperatureConfig: { Variables: [
        { IntakeAirTemperatureServiceId: { Type: "uint16", Value: 2002, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" }}
    ] },
    EngineCoolantTemperatureServiceConfig: { Variables: [
        { EngineCoolantTemperatureServiceId: { Type: "uint16", Value: 2003, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ] },
    ManifoldAbsolutePressureServiceConfig: { Variables: [
        { ManifoldAbsolutePressureServiceId: { Type: "uint16", Value: 2004, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ] },
    VoltageConfig: { Variables: [
        { VoltageServiceId: { Type: "uint16", Value: 2005, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ] },
    ThrottlePositionConfig: { Variables: [
        { ThrottlePositionServiceId: { Type: "uint16", Value: 2006, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ] },
    EthanolContentConfig: { Variables: [
        { EthanolContentServiceId: { Type: "uint16", Value: 2007, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ] },
    VehicleSpeedConfig: { Variables: [
        { VehicleSpeedServiceId: { Type: "uint16", Value: 2008, Hidden: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ] }
}

for(var k in IOServicesIni) 
    if(!SensorServicesIni[k])
        SensorServicesIni[k]=IOServicesIni[k];