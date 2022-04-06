class VariableRegistry {
    constructor(prop) {
        Object.assign(this, prop);
        this.CreateIfNotFound = true;
    }
    Clear() {
        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(elementname === `CreateIfNotFound`)
                return;
            delete this[elementname];
        });
    }
    GenerateVariableId() {
        this.VariableIncrement ??= 0;
        return ++this.VariableIncrement;
    }
    GetVariableByReference(variableReference) {
        if(typeof variableReference === `string`) {
            if(variableReference.indexOf(`.`) !== -1) {
                const listName = variableReference.substring(0, variableReference.indexOf(`.`));
                var variableName = variableReference.substring(variableReference.indexOf(`.`) + 1);
                if(Array.isArray(this[listName])) {
                    var variable = this[listName].find(a => a.name === variableName);
                    if(variableName.indexOf(`(`) !== -1) {
                        var measurementName = variableName.substring(variableName.lastIndexOf(`(`) + 1);
                        measurementName = measurementName.substring(0, measurementName.length - 1);
                        variableName = variableName.substring(0, variableName.lastIndexOf(`(`));
                        variable ??= this[listName].find(a => a.name === variableName && a.measurementName === measurementName)
                        variable ??= this[listName].find(a => a.name === variableName)
                    }
                    if(variable) {
                        if(typeof variable.Id === `string`)
                            return this.GetVariableByReference(variable.Id);
                        return variable;
                    }
                }
            }
            if(typeof this[variableReference] === `string`)
                return this.GetVariableByReference(this[variableReference]);
            if(this[variableReference] !== undefined)
                return this[variableReference];
        }
        if(typeof variableReference === `number`)
            return variableReference;
        return undefined;
    }
    GetVariableId(variableReference) {
        var variable = this.GetVariableByReference(variableReference);
        if(variable === undefined && this.CreateIfNotFound)
            return this[variableReference] = this.GenerateVariableId();
        if(typeof variable === `object`)
            return variable.Id;
        return variable;
    }
    RegisterVariable(variableReference, Type, Id) {
        if(variableReference.indexOf(`.`) !== -1) {
            const listName = variableReference.substring(0, variableReference.indexOf(`.`));
            var variableName = variableReference.substring(variableReference.indexOf(`.`) + 1);
            let measurementName;
            if(variableName.indexOf(`(`) !== -1) {
                measurementName = variableName.substring(variableName.lastIndexOf(`(`) + 1);
                measurementName = measurementName.substring(0, measurementName.length - 1);
                variableName = variableName.substring(0, variableName.lastIndexOf(`(`));
            }
            this[listName] ??= [];
            this[listName].push({
                name: variableName,
                measurementName: measurementName,
                Type,
                Id: Id == undefined? this.GenerateVariableId() : Id
            });
        } else {
            this[variableReference] = Id == undefined? this.GenerateVariableId() : Id
        }
    }
    GetVariableReferenceList() {
        var variableReferences = {};
        for (var property in this) {
            if (this[property] === undefined)
                continue;
    
            if(property === `VariableIncrement` || property === `CreateIfNotFound`)
                continue;
            if(property.toLowerCase().indexOf(`temp`) === 0)
                continue;
    
            if (Array.isArray(this[property])) {
                variableReferences[property] ??= [];
                var arr = this[property];
    
                for (var i = 0; i < arr.length; i++) {
                    variableReferences[property].push({ name: arr[i].name, measurementName: arr[i].measurementName, Id: this.GetVariableId(arr[i].Id)})
                }
            } else {
                variableReferences[property] = this.GetVariableId(this[property]);
            }
        }
        return variableReferences;
    }
}

VariableRegister = new VariableRegistry();
function GetSelections(measurementName, output, inputs, calculations, calculationsOnly) {
    var selections = [];
    if (calculations?.length > 0) {
        var configGroups = calculations;
        if(!calculations[0].group && !calculations[0].calculations)
            configGroups = [{ group: `Calculations`, calculations: calculations }];

        for(var c = 0; c < configGroups.length; c++) {
            var configOptions = { group: configGroups[c].group, options: [] }
            calculations = configGroups[c].calculations;
            for (var i = 0; i < calculations.length; i++) {
                if (output !== undefined && calculations[i].output !== output) 
                    continue;

                if(measurementName !== undefined && ((calculations[i].measurementName !== undefined && measurementName !== calculations[i].measurementName) || (MeasurementType[measurementName] !== undefined && MeasurementType[measurementName] !== calculations[i].output)))
                    continue;
                
                if(inputs !== undefined) {
                    if(inputs.length !== calculations[i].inputs.length || calculations[i].inputs === undefined)
                        continue;
                    var inputsMatch = true;
                    for(var im = 0; im < inputs.length; im++){
                        if(inputs[im] !== calculations[i].inputs[im]){
                            inputsMatch = false;
                            break;
                        }
                    }
                    if(!inputsMatch)
                        continue;
                }
                configOptions.options.push({
                    name: calculations[i].displayName,
                    value: { value: calculations[i].name }
                });
            }
            if(configOptions.options.length > 0)
                selections.push(configOptions);
        }
    }

    if(!(inputs || calculationsOnly)) {
        for (var property in VariableRegister) {
            if (!Array.isArray(VariableRegister[property]))
                continue;

            var arr = VariableRegister[property];

            var arrSelections = { group: property, options: [] };

            for (var i = 0; i < arr.length; i++) {
                if ((!measurementName || arr[i].measurementName === measurementName) && (output === undefined || arr[i].Type === output)) {
                    arrSelections.options.push({
                        name: arr[i].name,
                        info: (!measurementName ? `[${arr[i].measurementName}]` : undefined),
                        value: { reference: property, value: arr[i].name, measurementName: arr[i].measurementName }
                    });
                }
            }
            if(arrSelections.options.length > 0)
                selections.push(arrSelections);
        }
    }

    if(selections.length === 1)
        return selections[0].options;

    return selections;
}

var AFRConfigs = [];
AFRConfigs.push(Calculation_Static);
AFRConfigs.push(Calculation_LookupTable);
AFRConfigs.push(Calculation_2AxisTable);
var InjectorEnableConfigs = [];
InjectorEnableConfigs.push(Calculation_Static);
InjectorEnableConfigs.push(Calculation_LookupTable);
InjectorEnableConfigs.push(Calculation_2AxisTable);
var IgnitionAdvanceConfigs = [];
IgnitionAdvanceConfigs.push(Calculation_Static);
IgnitionAdvanceConfigs.push(Calculation_LookupTable);
IgnitionAdvanceConfigs.push(Calculation_2AxisTable);
var IgnitionEnableConfigs = [];
IgnitionEnableConfigs.push(Calculation_Static);
IgnitionEnableConfigs.push(Calculation_LookupTable);
IgnitionEnableConfigs.push(Calculation_2AxisTable);
var IgnitionDwellConfigs = [];
IgnitionDwellConfigs.push(Calculation_Static);
IgnitionDwellConfigs.push(Calculation_LookupTable);
IgnitionDwellConfigs.push(Calculation_2AxisTable);
var CylinderAirTemperatureConfigs = [];
CylinderAirTemperatureConfigs.push(Calculation_Static);
var ManifoldAbsolutePressureConfigs = [];
ManifoldAbsolutePressureConfigs.push(Calculation_Static);
var VolumetricEfficiencyConfigs = [];
VolumetricEfficiencyConfigs.push(Calculation_Static);
VolumetricEfficiencyConfigs.push(Calculation_LookupTable);
VolumetricEfficiencyConfigs.push(Calculation_2AxisTable);
VolumetricEfficiencyConfigs.push(Calculation_Formula);

EngineFactoryIDs = {
    Offset : 40000,
    CylinderAirMass_SD: 1,
    InjectorPrime: 2,
    Position: 3,
    PositionPrediction: 4,
    EngineParameters: 5,
    ScheduleIgnition: 6,
    ScheduleInjection: 7,
    InjectorDeadTime: 8
}

function GetArrayType(tableValue) {
    var min = 18446744073709551615;
    var max = -9223372036854775808;
    for (var i = 0; i < tableValue.length; i++) {
        if (tableValue[i] % 1 != 0) {
            return `FLOAT`;
        }
        if (tableValue[i] < min) {
            min = tableValue[i];
        }
        if (tableValue[i] > max) {
            max = tableValue[i];
        }
    }
    if (typeof tableValue[0] === `boolean`) {
        return `BOOL`;
    }
    if (min < 0) {
        if (max < 0 || min < -max)
            return GetType(min);
        return GetType(-max);
    }
    return GetType(max);
}

function GetType(value) {
    if(value == undefined)
        return `VOID`;
    if(Array.isArray(value)) 
        return GetArrayType(value);
    if(typeof value === `boolean`)
        return `BOOL`
    if(value % 1 !== 0)
        return `FLOAT`;

    if(value < 0) {
        if(value < 128 && value > -129)
            return `INT8`;
        if(value < 32768 && value > -32759)
            return `INT16`;
        if(value < 2147483648 && value > -2147483649)
            return `INT32`;
        if(value < 9223372036854775807 && value > -9223372036854775808)
            return `INT64`;

        throw `number too big`;
    }

    if(value < 128)
        return `INT8`;
    if(value < 256)
        return `UINT8`;
    if(value < 32768)
        return `INT16`;
    if(value < 65536)
        return `UINT16`;
    if(value < 2147483648)
        return `INT32`;
    if(value < 4294967295)
        return `UINT32`;
    if(value < 9223372036854775807)
        return `INT64`;
    if(value < 18446744073709551615)
        return `UINT64`;
    throw `number too big`;
}

function GetTypeId(type) {
    switch(type) {
        case `VOID`: return 0;
        case `UINT8`: return 1;
        case `UINT16`: return 2;
        case `UINT32`: return 3;
        case `UINT64`: return 4;
        case `INT8`: return 5;
        case `INT16`: return 6;
        case `INT32`: return 7;
        case `INT64`: return 8;
        case `FLOAT`: return 9;
        case `DOUBLE`: return 10;
        case `BOOL`: return 11;
    }
}

PackedTypeAlignment = [
    { type: `INT8`, align: 1 }, 
    { type: `INT16`, align: 1 },
    { type: `INT32`, align: 1 },
    { type: `INT64`, align: 1 },
    { type: `BOOL`, align: 1 }, 
    { type: `UINT8`, align: 1 },
    { type: `UINT16`, align: 1 },
    { type: `UINT32`, align: 1 },
    { type: `UINT64`, align: 1 },
    { type: `FLOAT`, align: 1 },
    { type: `DOUBLE`, align: 1 },
]

STM32TypeAlignment = [
    { type: `INT8`, align: 1 }, 
    { type: `INT16`, align: 2 },
    { type: `INT32`, align: 4 },
    { type: `INT64`, align: 8 },
    { type: `BOOL`, align: 1 }, 
    { type: `UINT8`, align: 1 },
    { type: `UINT16`, align: 2 },
    { type: `UINT32`, align: 4 },
    { type: `UINT64`, align: 8 },
    { type: `FLOAT`, align: 4 },
    { type: `DOUBLE`, align: 8 },
]

x86TypeAlignment = [
    { type: `INT8`, align: 1 }, 
    { type: `INT16`, align: 2 },
    { type: `INT32`, align: 4 },
    { type: `INT64`, align: 8 },
    { type: `BOOL`, align: 1 }, 
    { type: `UINT8`, align: 1 },
    { type: `UINT16`, align: 2 },
    { type: `UINT32`, align: 4 },
    { type: `UINT64`, align: 8 },
    { type: `FLOAT`, align: 4 },
    { type: `DOUBLE`, align: 8 },
]

function Packagize(obj, val) {
    if(val.outputVariables || val.intputVariables) {
        obj.type = `Package`;
        obj.outputVariables = val.outputVariables;
        obj.inputVariables = val.inputVariables;
        return { value: [ obj ] };
    }
    return obj;
}

function Operation_Math(mathFactoryId) {
    if(this.a !== undefined) {
        this.inputVariables ??= [0,0];
        this.inputVariables[0] = this.a;
        delete this.a;
    }
    if(this.b !== undefined) {
        this.inputVariables ??= [0,0];
        this.inputVariables[1] = this.b;
        delete this.b;
    }
    if(this.result !== undefined) {
        this.outputVariables ??= [0];
        this.outputVariables[0] = this.result;
        delete this.result;
    }
    if(this.outputVariables || this.intputVariables){
        this.inputVariables ??= [0,0];
        this.outputVariables ??= [0];
    }

    return Packagize({ value: [ { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + mathFactoryId } ]}, this);
}

types = [
    { type: `INT8`, toArrayBuffer() { return new Int8Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `INT16`, toArrayBuffer() { return new Int16Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `INT32`, toArrayBuffer() { return new Int32Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `INT64`, toArrayBuffer() { return new BigInt64Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `BOOL`, toArrayBuffer() { return new Uint8Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `UINT8`, toArrayBuffer() { return new Uint8Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `UINT16`, toArrayBuffer() { return new Uint16Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `UINT32`, toArrayBuffer() { return new Uint32Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `UINT64`, toArrayBuffer() { return new BigUint64Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `FLOAT`, toArrayBuffer() { return new Float32Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `DOUBLE`, toArrayBuffer() { return new Float64Array(Array.isArray(this.value)? this.value : [this.value]).buffer; }},
    { type: `CompressedObject`, toArrayBuffer() { return base64ToArrayBuffer(lzjs.compressToBase64(stringifyObject(this.value))); }},
    { type: `VariableId`, toObj() { return { value: [{ type: `UINT32`, value: VariableRegister.GetVariableId(this.value) }]}; }},
    { type: `Package`, toObj() {
        this.value.unshift({ type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }); //Package
        
        const thisValue = this;
        this.outputVariables?.forEach(function(outputVariable) {
            thisValue.value.push({ type: `VariableId`, value: outputVariable ?? 0 })
        });

        delete this.outputVariables;

        this.inputVariables?.forEach(function(inputVariable) {
            thisValue.value.push({ type: `VariableId`, value: inputVariable ?? 0 })
        });

        delete this.inputVariables;

        return this;
    }},
    { type: `Group`, toObj() {
        let newValue = [];
        const thisGroup = this;
        
        this.value.forEach(function(value) {
            if(isEmptyObject(value))
                return;
            else if(value?.type === `Group`) {
                if(value.types && thisGroup.types === undefined) {
                    thisGroup.types = [];
                }
                for(var typeIndex in value.types){
                    var typetypeInfo = thisGroup.types.find(x => x.type === value.types[typeIndex].type);
                    if(typetypeInfo === undefined){
                        thisGroup.types.push(value.types[typeIndex]);
                    }
                }
                newValue = newValue.concat(value.value.filter(x=>!isEmptyObject(x)));
            }
            else
                newValue.push(value);
        })

        newValue.unshift({ type: `UINT16`, value: newValue.length });
        newValue.unshift({ type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }); //Group
        this.value = newValue;

        return Packagize(this, this);
    }},
    { type: `Operation_StaticVariable`, toObj() {
        if(this.result !== undefined){
            this.outputVariables = [this.result];
            delete this.result;
        }

        var type = GetType(this.value);
        var typeID = GetTypeId(type);
        return Packagize({ value: [ 
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Static},
            { type: `UINT8`, value: typeID }, //typeid
            { type: type, value: this.value } //val
        ]}, this);
    }},
    { type: `Operation_Add`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.Add) }},
    { type: `Operation_Subtract`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.Subtract); }},
    { type: `Operation_Multiply`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.Multiply); }},
    { type: `Operation_Divide`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.Divide); }},
    { type: `Operation_And`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.And); }},
    { type: `Operation_Or`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.Or); }},
    { type: `Operation_GreaterThan`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.GreaterThan); }},
    { type: `Operation_LessThan`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.LessThan); }},
    { type: `Operation_Equal`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.Equal); }},
    { type: `Operation_GreaterThanOrEqual`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.GreaterThanOrEqual); }},
    { type: `Operation_LessThanOrEqual`, toObj() { return Operation_Math.call(this, OperationArchitectureFactoryIDs.LessThanOrEqual); }}
]

for(var index in STM32TypeAlignment) {
    var type = types.find(x => x.type == x86TypeAlignment[index].type);
    if(type){
        type.align = x86TypeAlignment[index].align
    }
}




