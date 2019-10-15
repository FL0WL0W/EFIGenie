var ReluctorServicesIni = {
};

ReluctorOperationSelections = [
    { Name: "Reluctor GM24x", IniName: "Operation_ReluctorGM24x" },
    { Name: "Reluctor 2x", IniName: "Operation_ReluctorUniversal2x" },
];

var ReluctorServicesIni = {
    Operation_ReluctorGM24x: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 1001, Static: true } }
    ] },
    Operation_ReluctorUniversal2x: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 1002, Static: true } }
    ] },
};

$.each(ReluctorOperationSelections, function(index, value) {
    OperationSelections.push(value);
});