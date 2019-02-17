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