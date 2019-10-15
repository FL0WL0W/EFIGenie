EngineControlOperationSelections = [
    { Name: "Engine Position", IniName: "Operation_EnginePosition" },
    { Name: "Engine Position Prediction", IniName: "Operation_EnginePositionPrediction" },
];

var EngineControlServicesIni = {
    Operation_EnginePosition: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 2001, Static: true } },
        { CrankPriority: { Type: "bool", Label: "Crank Is Priority", Value: true } }
    ] },
    Operation_EnginePositionPrediction: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 2002, Static: true } }
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