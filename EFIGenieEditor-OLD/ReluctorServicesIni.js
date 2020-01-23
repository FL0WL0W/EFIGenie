var ReluctorServicesIni = {
};

ReluctorOperationSelections = [
    { Name: "Reluctor GM24x", IniName: "Operation_ReluctorGM24x" },
    { Name: "Reluctor 2x", IniName: "Operation_ReluctorUniversal2x" },
];

var ReluctorServicesIni = {
    Operation_ReluctorGM24x: { Output: "ReluctorResult", Inputs: [{ Label: "Record", Type: "Record"}, { Label: "At tick", Type: "ScalarVariable"}], Variables : [
        { FactoryID: { Type: "uint16", Value: 1001, Static: true } }
    ] },
    Operation_ReluctorUniversal2x: { Output: "ReluctorResult", Inputs: [{ Label: "Record", Type: "Record"}, { Label: "At tick", Type: "ScalarVariable"}], Variables : [
        { FactoryID: { Type: "uint16", Value: 1002, Static: true } },
        { RisingPosition: { Type: "float", Label: "Rising Position", Value: 0 } },
        { FallingPosition: { Type: "float", Label: "Falling Position", Value: 180 } }
    ] },
};

$.each(ReluctorOperationSelections, function(index, value) {
    OperationSelections.push(value);
});