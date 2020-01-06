EngineControlOperationSelections = [
    { Name: "Engine Position", IniName: "Operation_EnginePosition" },
    { Name: "Engine Position Prediction", IniName: "Operation_EnginePositionPrediction" },
    { Name: "Engine Position Ticks To Degrees", IniName: "Operation_EnginePositionTicksToDegrees" },
    { Name: "Engine Schedule Ignition", IniName: "Operation_EngineScheduleIgnition" },
    { Name: "Engine Schedule Injection", IniName: "Operation_EngineScheduleInjection" },
    { Name: "Engine Schedule Ignition Array", IniName: "Operation_EngineScheduleIgnitionArray" },
    { Name: "Engine Schedule Injection Array", IniName: "Operation_EngineScheduleInjectionArray" },
];

var EngineControlServicesIni = {
    Operation_EngineScheduleIgnition: { Output: "tuple<ScalarVariable, ScalarVariable>", Inputs: [{ Label: "Engine Position", Type: "EnginePosition"}, { Label: "Ignition Dwell", Type: "ScalarVariable"}, { Label: "Ignition Advance", Type: "ScalarVariable"}], Variables : [
        { FactoryID: { Type: "uint16", Value: 2003, Static: true } },
        { TDC: { Type: "float", Label: "TDC", Value: 0 } },
        { Operation: { Label: "Ignition Output", Type: "uint16", Selections: "/OperationBus", FilterOn: "Inputs/0/Type", Filter: "ScalarVariable" } }
    ] },
    Operation_EngineScheduleInjection: { Output: "tuple<ScalarVariable, ScalarVariable>", Inputs: [{ Label: "Engine Position", Type: "EnginePosition"}, { Label: "Injection PulseWidth", Type: "ScalarVariable"}, { Label: "Injection End Position", Type: "ScalarVariable"}], Variables : [
        { FactoryID: { Type: "uint16", Value: 2004, Static: true } },
        { TDC: { Type: "float", Label: "TDC", Value: 0 } },
        { Operation: { Label: "Injection Output", Type: "uint16", Selections: "/OperationBus", FilterOn: "Inputs/0/Type", Filter: "ScalarVariable" } }
    ] },
    Operation_EngineScheduleIgnitionArray: { Output: "EngineScheduleIgnitionArray", Inputs: [{ Label: "Engine Position", Type: "EnginePosition"}, { Label: "Ignition Dwell", Type: "ScalarVariable"}, { Label: "Ignition Advance", Type: "ScalarVariable"}], Variables : [
        { FactoryID: { Type: "uint16", Value: 2005, Static: true } },
        { Length: { Type: "uint8", Label: "Length", Value: 8 } },
        { TDC: { Type: "float", XResolution: ".Length", XMax: ".Length", XMin: 1, XLabel: "Coil", ZLabel: "TDC", Label: "TDC", Value: [0, 90, 180, 270, 360, 450, 540, 630] } },
        { Coils: { Label: "Coils", IniName: "Operation_DigitalPinWrite", Array: ".Length", Label: "Coil", Labels: [ "Coil 1", "Coil 2", "Coil 3", "Coil 4", "Coil 5", "Coil 6", "Coil 7", "Coil 8", "Coil 9", "Coil 10", "Coil 11", "Coil 12", "Coil 13", "Coil 14", "Coil 15", "Coil 16" ] } }
    ] },
    Operation_EngineScheduleInjectionArray: { Output: "EngineScheduleInjectionArray", Inputs: [{ Label: "Engine Position", Type: "EnginePosition"}, { Label: "Injection PulseWidth", Type: "ScalarVariable"}, { Label: "Injection End Position", Type: "ScalarVariable"}], Variables : [
        { FactoryID: { Type: "uint16", Value: 2006, Static: true } },
        { Length: { Type: "uint8", Label: "Length", Value: 8 } },
        { TDC: { Type: "float", XResolution: ".Length", XMax: ".Length", XMin: 1, XLabel: "Injector", ZLabel: "TDC", Label: "TDC", Value: [0, 90, 180, 270, 360, 450, 540, 630] } },
        { Injectors: { Label: "Coils", IniName: "Operation_DigitalPinWrite", Array: ".Length", Label: "Injector", Labels: [ "Injector 1", "Injector 2", "Injector 3", "Injector 4", "Injector 5", "Injector 6", "Injector 7", "Injector 8", "Injector 9", "Injector 10", "Injector 11", "Injector 12", "Injector 13", "Injector 14", "Injector 15", "Injector 16"] } }
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