var OperationSelections = [
    { Name: "2 Axis Table", IniName: "Operation_2AxisTable" },
    { Name: "Lookup Table", IniName: "Operation_LookupTable" },
    { Name: "Polynomial", IniName: "Operation_Polynomial" },
    { Name: "Math", IniName: "Operation_Math" },
    { Name: "Seconds To Tick", IniName: "Operation_SecondsToTicks" },
    { Name: "Pin Read Analog", IniName: "Operation_AnalogPinRead" },
    { Name: "Pin Read Digital", IniName: "Operation_DigitalPinRead" },
    { Name: "Pin Read Frequency", IniName: "Operation_FrequencyPinRead" },
    { Name: "Pin Read Pulse Width", IniName: "Operation_PulseWidthPinRead" },
    { Name: "Pin Read DutyCycle", IniName: "Operation_DutyCyclePinRead" },
    { Name: "Pin Write Digital", IniName: "Operation_DigitalPinWrite" },
    { Name: "Pin Write PWM", IniName: "Operation_PwmPinWrite" },
    { Name: "Fault Detection", IniName: "Operation_FaultDetectionConfig" },
    { Name: "Get Tick", IniName: "Operation_GetTick" },
    { Name: "Schedule CallBack", IniName: "Operation_ScheduleCallBack" }
];
var VariableSelections = [
    { Name: "Static", IniName: "Variable_StaticScalar" },
    { Name: "Operation", IniName: "Variable_Operation" },
    { Name: "Pin Record Digital", IniName: "Variable_DigitalPinRecord" }
];

var EmbeddedIOServicesIni = {
    ScalarVariable: { Variables : [
        { Type: { Label: " Type", Type: "uint8", Value: 1, Selections: [ "INVALID", "UINT8", "UINT16", "UINT32", "UINT64", "INT8", "INT16", "INT32", "INT64", "FLOAT", "DOUBLE", "BOOLEAN", "TICK" ] } },
        { Value: { Type: ".Type", Label: " Value" } }//fix this
    ] },

    Variable_StaticScalar: {  Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_VARIABLE: { Type: "uint16", Value: 7001, Static: true } },
        { FactoryID: { Type: "uint16", Value: 13, Static: true } },
        { VariableID: { Type: "uint16", Value: "./iterator", Static: true } },
        { Value: { IniName: "ScalarVariable", Label: "" } }
    ] },
    Variable_DigitalPinRecord: {  Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_VARIABLE: { Type: "uint16", Value: 7001, Static: true } },
        { FactoryID: { Type: "uint16", Value: 12, Static: true } },
        { VariableID: { Type: "uint16", Value: "./iterator", Static: true } },
        { Length: { Type: "uint8", Label: "Record Length" } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { Inverted: { Type: "bool", Label: "Inverted" } }
    ] },
    Variable_Operation: {  Output: "Operation/Output", Inputs: "Operation/Inputs", Variables : [
        { BUILDER_VARIABLE: { Type: "uint16", Value: 7001, Static: true } },
        { FactoryID: { Type: "uint16", Value: ".Operation/Selection/FactoryID", Static: true } },
        { VariableOutputID: { Type: "uint16", Value: "./iterator", Static: true, ExcludeFromBin: "!.Output" } },
        { Operation: { Label: "Operation", Type: "uint16", Selections: "/OperationBus" } },
        { VariableInputIDs: { Array: ".Inputs/length", Variables : [
            { Variable: { Label: "Variable", Type: "uint16", Selections: "/VariableBus" } },
        ] } }
    ] },
    IVariable: { Variables : [
        { Selection: { Label: "Input", Selections: VariableSelections } }
    ] },

    Operation_2AxisTable: { Output: "ScalarVariable", Inputs: ["ScalarVariable", "ScalaraVariable"], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 3, Static: true } },
        { MinXValue: { Type: "float", Label: "Min X", Value: 1 } },
        { MaxXValue: { Type: "float", Label: "Max X", Value: 4 } },
        { XResolution : { Label: "X Resolution", Type: "uint8", Min: 1, Value: 4 } },
        { MinYValue: { Type: "float", Label: "Min Y", Value: 1 } },
        { MaxYValue: { Type: "float", Label: "Max Y", Value: 4 } },
        { YResolution : { Label: "Y Resolution", Type: "uint8", Min: 1, Value: 4 } },
        { Type: { Label: " Type", Type: "uint8", Value: 1, Selections: [ "INVALID", "UINT8", "UINT16", "UINT32", "UINT64", "INT8", "INT16", "INT32", "INT64", "FLOAT", "DOUBLE", "BOOLEAN", "TICK" ] } },
        { Table: { Type: ".Type", XResolution: ".XResolution", YResolution: ".YResolution", XLabel: "X", YLabel: "Y", ZLabel: "Z", Label: "Table", XMin: "./iterator", XMax: ".MaxXValue", YMin: ".MinYValue", YMax: ".MaxYValue", Dialog: true } }
    ] },
    Operation_AnalogPinRead: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 5, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } }
    ] },
    Operation_DigitalPinRead: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 4, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { Inverted: { Type: "bool", Label: "Inverted" } }
    ] },
    Operation_DigitalPinWrite: { Output: false, Inputs: ["ScalarVariable"], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 10, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { NormalOn: { Type: "bool", Label: "Normaly High" } },
        { HighZ: { Type: "bool", Label: "High Z" } }
    ] },
    Operation_DutyCyclePinRead: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 8, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { MinFrequency: { Type: "uint16", Label: "minFrequency" } }
    ] },
    Operation_FaultDetectionConfig: { Output: "ScalarVariable", Inputs: ["ScalarVariable"], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 9, Static: true } },
        { MinValue: { Type: "float", Label: "Min" } },
        { MaxValue: { Type: "float", Label: "Max" } },
        { Default: { Type: "float", Label: "Default"} }
    ] },
    Operation_FrequencyPinRead: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 6, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { MinFrequency: { Type: "uint16", Label: "minFrequency" } }
    ] },
    Operation_GetTick: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 16, Static: true } }
    ] },
    Operation_LookupTable: { Output: "ScalarVariable", Inputs: ["ScalarVariable"], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 2, Static: true } },
        { MinXValue: { Type: "float", Label: "Min", Value: 1 } },
        { MaxXValue: { Type: "float", Label: "Max", Value: 4 } },
        { XResolution : { Label: "Resolution", Type: "uint8", Min: 1, Value: 4 } },
        { Type: { Label: " Type", Type: "uint8", Value: 1, Selections: [ "INVALID", "UINT8", "UINT16", "UINT32", "UINT64", "INT8", "INT16", "INT32", "INT64", "FLOAT", "DOUBLE", "BOOLEAN", "TICK" ] } },
        { Table: { Type: ".Type", XResolution: ".XResolution", YResolution: 0, XLabel: "IN", YLabel: "OUT", ZLabel: "Z", Label: "Table", XMin: ".MinXValue", XMax: ".MaxXValue", Dialog: true } }
    ] },
    Operation_Math: { Output: "ScalarVariable", Inputs: ["ScalarVariable", "ScalarVariable"], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 14, Static: true } },
        { Type: { Label: "Operation", Type: "uint8", Value: 0, Selections: [ "ADD", "SUBTRACT",	"MULTIPLY",	"DIVIDE", "AND", "OR", "GREATERTHAN", "LESSTHAN", "EQUAL", "GREATERTHANOREQUAL", "LESSTHANOREQUAL" ] } }
    ] },
    Operation_Polynomial: { Output: "ScalarVariable", Inputs: ["ScalarVariable"], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 1, Static: true } },
        { MinXValue: { Type: "float", Label: "Min" } },
        { MaxXValue: { Type: "float", Label: "Max" } },
        { Degree: { Type: "uint8", Label: "Degree", Value: 4 } },
        { A: { Type: "formula", Degree: ".Degree", Label: "Coefficients" } }
    ] },
    Operation_PulseWidthPinRead: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 7, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { MinFrequency: { Type: "uint16", Label: "minFrequency" } }
    ] },
    Operation_PwmPinWrite: { Output: "ScalarVariable", Inputs: [], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 11, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { MinFrequency: { Type: "uint16", Label: "minFrequency" } }
    ] },
    Operation_ScheduleCallBack: { Output: false, Inputs: ["ScalarVariable"], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 15, Static: true } },
        { VariableFactoryID: { Type: "uint16", Value: ".Operation/Selection/FactoryID", Static: true } },
        { VariableOutputID: { Type: "uint16", Value: "./iterator", Static: true, ExcludeFromBin: "!.Output" } },
        { Operation: { Label: "Operation", Type: "uint16", Selections: "/OperationBus" } },
        { VariableInputIDs: { Array: ".Inputs/length", Variables : [
            { Variable: { Label: "Variable", Type: "uint16", Selections: "/VariableBus" } },
        ] } }
    ] },
    Operation_SecondsToTicks: { Output: "ScalarVariable", Inputs: ["ScalarVariable"], Variables : [
        { BUILDER_OPERATION: { Type: "uint16", Value: 6001, Static: true } },
        { InstanceID: { Type: "uint16", Value: "./iterator", Static: true } },
        { FactoryID: { Type: "uint16", Value: 17, Static: true } }
    ] },
    IOperation: { Output: "Selection/Output", Inputs: "Selection/Inputs", Variables : [
        { Selection: { Label: "Operation", Selections: OperationSelections } }
    ] },

    Main: { Tabbed: true, Variables: [
        { OperationBus: { Label: "Operations", Name: "Operation", IniName: "IOperation", NamedList: true } },
        { VariableBus: { Label: " Variables", Name: "Variable", IniName: "IVariable", NamedList: true } },
        { EOF: { Type: "uint16", Value: 0, Static: true } }
    ] }
};