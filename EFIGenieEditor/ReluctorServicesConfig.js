var ReluctorServicesIni = {
    ReluctorGM24x: { Variables: [
        { ReluctorGM24xServiceId: { Type: "uint8", Value: 1, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } }
    ] },
    Reluctor2x: { Variables: [
        { ReluctorGM24xServiceId: { Type: "uint8", Value: 2, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { RisingPosition: { Type: "float", Label: "Rising Position", Units: DegreeUnits } },
        { FallingPosition: { Type: "float", Label: "Falling Position", Units: DegreeUnits } }
    ] },
    IReluctorConfig: { Variables: [
        { BUILDER_IRELUCTOR: { Type: "uint16", Value: 2004, Static: true } },
        { InstanceId: { Type: "uint8", Value: "./Instance", Static: true } },
        { Selection: { Label: "Reluctor", Selections: [
            { Name: "None", IniName: "NoneServiceConfig"},
            { Name: "GM24x", IniName: "ReluctorGM24x"},
            { Name: "2x", IniName: "Reluctor2x"}
        ] } }
    ] },
}