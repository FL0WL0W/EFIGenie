EngineControlOperationSelections = [
    { Name: "Engine Position", IniName: "Operation_EnginePosition" },
    { Name: "Engine Position Prediction", IniName: "Operation_EnginePositionPrediction" },
    { Name: "Engine Position Ticks To Degrees", IniName: "Operation_EnginePositionTicksToDegrees" },
    { Name: "Engine Schedule Ignition", IniName: "Operation_EngineScheduleIgnition" },
];

var EngineControlServicesIni = {
    Operation_EngineScheduleIgnition: { Output: "tuple<uint32_t, uint32_t>", Inputs: [{ Label: "Engine Position", Type: "EnginePosition"}, { Label: "Ignition Dwell", Type: "ScalarVariable"}, { Label: "Ignition Advance", Type: "ScalarVariable"}], Variables : [
        { FactoryID: { Type: "uint16", Value: 2003, Static: true } },
        { TDC: { Type: "float", Label: "TDC", Value: 0 } },
        { Operation: { Label: "Ignition Output", Type: "uint16", Selections: "/OperationBus", FilterOn: "Inputs/0/Type", Filter: "ScalarVariable" } }
    ] },
    Operation_EnginePosition: { Output: "EnginePosition", Inputs: [{ Label: "Crank Position", Type: "ReluctorResult"}, { Label: "Cam Position", Type: "ReluctorResult"}], Variables : [
        { FactoryID: { Type: "uint16", Value: 2001, Static: true } },
        { CrankPriority: { Type: "bool", Label: "Crank Is Priority", Value: true } }
    ] },
    Operation_EnginePositionPrediction: { Output: "ScalarVariable", Inputs: [{ Label: "Desired Position", Type: "ScalarVariable"}, { Label: "Engine Position", Type: "EnginePosition"}], Variables : [
        { FactoryID: { Type: "uint16", Value: 2002, Static: true } }
    ] },
    Operation_EnginePositionTicksToDegrees: { Output: "ScalarVariable", Inputs: [{ Label: "Ticks", Type: "ScalarVariable"}, { Label: "Engine Position", Type: "EnginePosition"}], Variables : [
        { FactoryID: { Type: "uint16", Value: 2003, Static: true } }
    ] },
};

for(var k in ReluctorServicesIni) {
    if(!EngineControlServicesIni[k]) {
        EngineControlServicesIni[k]=ReluctorServicesIni[k];
    }
}

for(var k in EmbeddedIOServicesIni) {
    if(!EngineControlServicesIni[k]) {
        EngineControlServicesIni[k]=EmbeddedIOServicesIni[k];
    }
}

$.each(EngineControlOperationSelections, function(index, value) {
    OperationSelections.push(value);
});