class VariableRegistry {
    constructor(prop) {
        Object.assign(this, prop)
        this.CreateIfNotFound = true
    }
    Clear() {
        Object.entries(this).forEach(e => {
            var [elementname, element] = e
            if(elementname === `CreateIfNotFound`)
                return
            delete this[elementname]
        })
    }
    GenerateVariableId() {
        this.VariableIncrement ??= 0
        return ++this.VariableIncrement
    }
    GetVariableByReference(variableReference) {
        if(typeof variableReference === `string`) {
            if(variableReference.indexOf(`.`) !== -1) {
                const listName = variableReference.substring(0, variableReference.indexOf(`.`))
                var variableName = variableReference.substring(variableReference.indexOf(`.`) + 1)
                if(Array.isArray(this[listName])) {
                    var variable = this[listName].find(a => a.name === variableName)
                    if(variableName.indexOf(`(`) !== -1) {
                        var measurementName = variableName.substring(variableName.lastIndexOf(`(`) + 1)
                        measurementName = measurementName.substring(0, measurementName.length - 1)
                        variableName = variableName.substring(0, variableName.lastIndexOf(`(`))
                        variable ??= this[listName].find(a => a.name === variableName && a.measurementName === measurementName)
                        variable ??= this[listName].find(a => a.name === variableName)
                    }
                    if(variable) {
                        if(typeof variable.Id === `string`)
                            return this.GetVariableByReference(variable.Id)
                        return variable
                    }
                }
            }
            if(typeof this[variableReference] === `string`)
                return this.GetVariableByReference(this[variableReference])
            if(this[variableReference] !== undefined)
                return this[variableReference]
        }
        if(typeof variableReference === `number`)
            return variableReference
        return undefined
    }
    GetVariableId(variableReference) {
        var variable = this.GetVariableByReference(variableReference)
        if(variable === undefined && this.CreateIfNotFound)
        {
            if(typeof variableReference === `string` && variableReference.indexOf(`.`) !== -1) {
                const listName = variableReference.substring(0, variableReference.indexOf(`.`))
                this[listName] ??= []
                var variableName = variableReference.substring(variableReference.indexOf(`.`) + 1)
                var measurementName
                if(variableName.indexOf(`(`) !== -1) {
                    measurementName = variableName.substring(variableName.lastIndexOf(`(`) + 1)
                    measurementName = measurementName.substring(0, measurementName.length - 1)
                    variableName = variableName.substring(0, variableName.lastIndexOf(`(`))
                }
                var Id = this.GenerateVariableId()
                this[listName].push({ name: variableName, measurementName, Id})
                return Id
            } else {
                return this[variableReference] = this.GenerateVariableId()
            }
        }
        if(typeof variable === `object`)
            return variable.Id
        return variable
    }
    RegisterVariable(variableReference, Type, Id) {
        if(variableReference.indexOf(`.`) !== -1) {
            const listName = variableReference.substring(0, variableReference.indexOf(`.`))
            var variableName = variableReference.substring(variableReference.indexOf(`.`) + 1)
            let measurementName
            if(variableName.indexOf(`(`) !== -1) {
                measurementName = variableName.substring(variableName.lastIndexOf(`(`) + 1)
                measurementName = measurementName.substring(0, measurementName.length - 1)
                variableName = variableName.substring(0, variableName.lastIndexOf(`(`))
            }
            this[listName] ??= []
            const existing = this[listName].findIndex(r => r.name === variableName && (measurementName == undefined || measurementName == r.measurementName))
            if(existing >= 0) {
                Id ??= this[listName][existing].Id
                this[listName].splice(existing, 1)
            }
            this[listName].push({
                name: variableName,
                measurementName: measurementName,
                Type,
                Id: Id ?? this.GenerateVariableId()
            })
        } else {
            this[variableReference] = Id ?? this.GenerateVariableId()
        }
    }
    GetVariableReferenceList() {
        var variableReferences = {}
        for (var property in this) {
            if (this[property] === undefined)
                continue
    
            if(property === `VariableIncrement` || property === `CreateIfNotFound`)
                continue
            if(property.toLowerCase().indexOf(`temp`) === 0)
                continue
    
            if (Array.isArray(this[property])) {
                variableReferences[property] ??= []
                var arr = this[property]
    
                for (var i = 0; i < arr.length; i++) {
                    variableReferences[property].push({ name: arr[i].name, measurementName: arr[i].measurementName, Id: this.GetVariableId(arr[i].Id)})
                }
            } else {
                variableReferences[property] = this.GetVariableId(this[property])
            }
        }
        return variableReferences
    }
}

VariableRegister = new VariableRegistry()
function defaultFilter(measurementName, output, inputs, calculationsOnly) {
    return function(calcOrVar) {
        //variable filter
        if(calcOrVar.Type) {
            if(inputs || calculationsOnly)
                return false
            if ((!measurementName || calcOrVar.measurementName === measurementName) && (output === undefined || output.split(`|`).indexOf(calcOrVar.Type) >= 0))
                return true
            return false
        }

        //calculation Filter
        if (output !== undefined && !calcOrVar.output?.split(`|`).some(o=> output.split(`|`).indexOf(o) > -1)) 
            return false

        if(measurementName !== undefined && ((calcOrVar.measurementName !== undefined && measurementName !== calcOrVar.measurementName) || (MeasurementType[measurementName] !== undefined && calcOrVar.output?.split(`|`).indexOf(MeasurementType[measurementName]) < 0)))
            return false
        
        if(inputs !== undefined) {
            if(calcOrVar.inputs === undefined || inputs.length !== calcOrVar.inputs.length)
                return false
            var inputsMatch = true
            for(var im = 0; im < inputs.length; im++){
                if(inputs[im] !== calcOrVar.inputs[im]){
                    inputsMatch = false
                    break
                }
            }
            if(!inputsMatch)
                return false
        }
        return true

    }
}
function GetSelections(calculations, filter) {
    var selections = []
    if (calculations?.length > 0) {
        var configGroups = calculations
        if(!calculations[0].group && !calculations[0].calculations)
            configGroups = [{ group: `Calculations`, calculations: calculations }]

        for(var c = 0; c < configGroups.length; c++) {
            var configOptions = { group: configGroups[c].group, options: [] }
            calculations = configGroups[c].calculations
            for (var i = 0; i < calculations.length; i++) {
                if(!filter || filter(calculations[i])) {
                    configOptions.options.push({
                        name: calculations[i].displayName,
                        value: { value: calculations[i].name }
                    })
                }
            }
            if(configOptions.options.length > 0)
                selections.push(configOptions)
        }
    }

    for (var property in VariableRegister) {
        if (!Array.isArray(VariableRegister[property]))
            continue

        var arr = VariableRegister[property]

        var arrSelections = { group: property, options: [] }

        for (var i = 0; i < arr.length; i++) {
            if (!filter || filter(arr[i])) {
                arrSelections.options.push({
                    name: arr[i].name,
                    info: `[${arr[i].measurementName}]`,
                    value: { reference: `${property}.${arr[i].name}${arr[i].measurement? `(${arr[i].measurement})` : ``}` }
                })
            }
        }
        if(arrSelections.options.length > 0)
            selections.push(arrSelections)
    }

    if(selections.length === 1)
        return selections[0].options

    return selections
}

var AFRConfigs = []
AFRConfigs.push(Calculation_Static)
AFRConfigs.push(Calculation_LookupTable)
AFRConfigs.push(Calculation_2AxisTable)
var InjectorEnableConfigs = []
InjectorEnableConfigs.push(Calculation_Static)
InjectorEnableConfigs.push(Calculation_Formula)
var IgnitionAdvanceConfigs = []
IgnitionAdvanceConfigs.push(Calculation_Static)
IgnitionAdvanceConfigs.push(Calculation_LookupTable)
IgnitionAdvanceConfigs.push(Calculation_2AxisTable)
var IgnitionEnableConfigs = []
IgnitionEnableConfigs.push(Calculation_Static)
IgnitionEnableConfigs.push(Calculation_Formula)
var IgnitionDwellConfigs = []
IgnitionDwellConfigs.push(Calculation_Static)
IgnitionDwellConfigs.push(Calculation_LookupTable)
IgnitionDwellConfigs.push(Calculation_2AxisTable)
var CylinderAirTemperatureConfigs = []
CylinderAirTemperatureConfigs.push(Calculation_Static)
var ManifoldAbsolutePressureConfigs = []
ManifoldAbsolutePressureConfigs.push(Calculation_Static)
var VolumetricEfficiencyConfigs = []
VolumetricEfficiencyConfigs.push(Calculation_Static)
VolumetricEfficiencyConfigs.push(Calculation_LookupTable)
VolumetricEfficiencyConfigs.push(Calculation_2AxisTable)
VolumetricEfficiencyConfigs.push(Calculation_Formula)

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
    var min = 18446744073709551615
    var max = -9223372036854775808
    for (var i = 0; i < tableValue.length; i++) {
        if (tableValue[i] % 1 != 0) {
            return `FLOAT`
        }
        if (tableValue[i] < min) {
            min = tableValue[i]
        }
        if (tableValue[i] > max) {
            max = tableValue[i]
        }
    }
    if (typeof tableValue[0] === `boolean`) {
        return `BOOL`
    }
    if (min < 0) {
        if (max < 0 || min < -max)
            return GetType(min)
        return GetType(-max)
    }
    return GetType(max)
}

function GetType(value) {
    if(value == undefined)
        return `VOID`
    if(Array.isArray(value)) 
        return GetArrayType(value)
    if(typeof value === `boolean`)
        return `BOOL`
    if(value % 1 !== 0)
        return `FLOAT`

    if(value < 0) {
        if(value < 128 && value > -129)
            return `INT8`
        if(value < 32768 && value > -32759)
            return `INT16`
        if(value < 2147483648 && value > -2147483649)
            return `INT32`
        if(value < 9223372036854775807 && value > -9223372036854775808)
            return `INT64`

        throw `number too big`
    }

    if(value < 128)
        return `INT8`
    if(value < 256)
        return `UINT8`
    if(value < 32768)
        return `INT16`
    if(value < 65536)
        return `UINT16`
    if(value < 2147483648)
        return `INT32`
    if(value < 4294967295)
        return `UINT32`
    if(value < 9223372036854775807)
        return `INT64`
    if(value < 18446744073709551615)
        return `UINT64`
    throw `number too big`
}

function GetTypeId(type) {
    switch(type) {
        case `VOID`: return 0
        case `UINT8`: return 1
        case `UINT16`: return 2
        case `UINT32`: return 3
        case `UINT64`: return 4
        case `INT8`: return 5
        case `INT16`: return 6
        case `INT32`: return 7
        case `INT64`: return 8
        case `FLOAT`: return 9
        case `DOUBLE`: return 10
        case `BOOL`: return 11
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

function Packagize(definition, val) {
    if(val.result !== undefined){
        val.outputVariables = [val.result]
        delete val.result
    }
    if( (val.outputVariables && val.outputVariables.some(x => x !== undefined)) || 
        (val.intputVariables && val.intputVariables.some(x => x !== undefined))) {
        definition.type = `Package`
        definition.outputVariables = val.outputVariables
        definition.inputVariables = val.inputVariables
        return { type: `definition`, value: [ definition ] }
    }
    return definition
}

function Calculation_Math(mathFactoryId) {
    if(this.a !== undefined) {
        this.inputVariables ??= [0,0]
        this.inputVariables[0] = this.a
        delete this.a
    }
    if(this.b !== undefined) {
        this.inputVariables ??= [0,0]
        this.inputVariables[1] = this.b
        delete this.b
    }
    if(this.result !== undefined) {
        this.outputVariables ??= [0]
        this.outputVariables[0] = this.result
        delete this.result
    }
    if(this.outputVariables || this.intputVariables){
        this.inputVariables ??= [0,0]
        this.outputVariables ??= [0]
    }

    return Packagize({ type: `definition`, value: [ { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + mathFactoryId } ]}, this)
}

function ReluctorTemplate(val, recordResult, definition) {
    let o = { type: `Group`, value: [
        { ...val, type: `Input_DigitalRecord`, result: recordResult },
        definition
    ]}
    return o;
}

function mapDefinitionFromValue(value) {
    const typeInfo = this.types?.find(t => t.type == value.type);
    let definition = value.definition ?? typeInfo?.definition
    if(definition) return definition

    let subToDefinition = value.toDefinition ?? typeInfo?.toDefinition;

    if(subToDefinition) {
        value.types ??= [];
        for(let typeIndex in this.types){
            if(value.types.find(x => x.type === this.types[typeIndex].type) === undefined){
                value.types.push(this.types[typeIndex])
            }
        }    

        return subToDefinition.call(value).value.flatMap(v => mapDefinitionFromValue.call(value, v));
    }
    return value;
}
function toDefinition() {
    let definitions = this.value.flatMap(v => mapDefinitionFromValue.call(this, v));
    return { type: `definition`, value: definitions, types: this.types }
}
function toArrayBuffer() {
    let definition = toDefinition.call(this)
    var buffer = new ArrayBuffer();
    for(var index in definition.value){
        var typeInfo = definition.types.find(x => x.type === definition.value[index].type);

        //align
        var align = definition.value[index].align;
        if(align === undefined && typeInfo !== undefined){
            align = typeInfo.align;
        }
        if(align) {
            buffer = buffer.align(align);
        }

        var toArrayBuffer = definition.value[index].toArrayBuffer;
        if(toArrayBuffer === undefined && typeInfo !== undefined && definition.value[index].type !== `definition`){
            toArrayBuffer = typeInfo.toArrayBuffer;
        }
        if(toArrayBuffer !== undefined){
            buffer = buffer.concatArray(toArrayBuffer.call(definition.value[index]));
        }
    }
    return buffer;
}

types = [
    { type: `definition`, toDefinition, toArrayBuffer},
    { type: `INT8`, toArrayBuffer() { return new Int8Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `INT16`, toArrayBuffer() { return new Int16Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `INT32`, toArrayBuffer() { return new Int32Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `INT64`, toArrayBuffer() { return new BigInt64Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `BOOL`, toArrayBuffer() { return new Uint8Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `UINT8`, toArrayBuffer() { return new Uint8Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `UINT16`, toArrayBuffer() { return new Uint16Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `UINT32`, toArrayBuffer() { return new Uint32Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `UINT64`, toArrayBuffer() { return new BigUint64Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `FLOAT`, toArrayBuffer() { return new Float32Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `DOUBLE`, toArrayBuffer() { return new Float64Array(Array.isArray(this.value)? this.value : [this.value]).buffer }},
    { type: `CompressedObject`, toArrayBuffer() { return base64ToArrayBuffer(lzjs.compressToBase64(stringifyObject(this.value))) }},
    { type: `VariableId`, toDefinition() { return { type: `definition`, value: [{ type: `UINT32`, value: VariableRegister.GetVariableId(this.value) }]} }},
    { type: `Package`, toDefinition() {
        this.value.unshift({ type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }) //Package
        
        const thisValue = this
        this.outputVariables?.forEach(function(outputVariable) {
            thisValue.value.push({ type: `VariableId`, value: outputVariable ?? 0 })
        })

        delete this.outputVariables

        this.inputVariables?.forEach(function(inputVariable) {
            thisValue.value.push({ type: `VariableId`, value: inputVariable ?? 0 })
        })

        delete this.inputVariables

        this.type = `definition`

        return this
    }},
    { type: `Group`, toDefinition() {
        let newValue = []
        const thisGroup = this

        const removedTypes = [...this.types.filter(t => t.type === `Group` || t.type === `Package`)]
        this.types = this.types.filter(t => !(t.type === `Group` || t.type === `Package`))
        function reduce(value) {
            if(isEmptyObject(value))
                return
                
            let definition = mapDefinitionFromValue.call(thisGroup, value)
            if(!Array.isArray(definition))
                definition = [definition];
            for(index in definition)
            {
                //consolidate group
                if(definition[index].type === `Group`) {
                    for(var typeIndex in definition[index].types){
                        var typetypeInfo = thisGroup.types.find(x => x.type === definition[index].types[typeIndex].type)
                        if(typetypeInfo === undefined){
                            thisGroup.types.push(definition[index].types[typeIndex])
                        }
                    }
                    definition[index].value.forEach(reduce)
                //if type is package add to newValue
                } else if(definition[index].type === `Package`) {
                    newValue.push(definition[index])
                //if type is not package than create a definition for it
                } else {
                    if(newValue[newValue.length - 1].type !== `definition`) {
                        newValue.push({ type: `definition`, value: [definition[index]] })
                    } else {
                        newValue[newValue.length - 1].value.push(definition[index])
                    }
                }
            }
        }
        this.value.forEach(reduce);
        this.types = [...this.types, ...removedTypes]

        newValue.unshift({ type: `UINT16`, value: newValue.length })
        newValue.unshift({ type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }) //Group
        this.value = newValue
        this.type = `definition`

        return Packagize(this, this)
    }},
    { type: `Calculation_Static`, toDefinition() {
        var type = GetType(this.value)
        var typeID = GetTypeId(type)
        return Packagize({ type: `definition`, value: [ 
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Static},
            { type: `UINT8`, value: typeID }, //typeid
            { type: type, value: this.value } //val
        ]}, this)
    }},
    { type: `Calculation_2AxisTable`, toDefinition() {
        this.inputVariables ??= [ undefined, undefined ]
        if(this.XSelection?.reference)
            this.inputVariables[0] = this.XSelection.reference
        if(this.YSelection?.reference)
            this.inputVariables[1] = this.YSelection.reference

        const type = GetArrayType(this.table.value)
        const typeId = GetTypeId(type)
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Table }, //factory ID
            { type: `FLOAT`, value: this.table.xAxis[0] }, //MinXValue
            { type: `FLOAT`, value: this.table.xAxis[this.table.xAxis.length-1] }, //MaxXValue
            { type: `FLOAT`, value: this.table.yAxis[0] }, //MinYValue
            { type: `FLOAT`, value: this.table.yAxis[this.table.yAxis.length-1] }, //MaxYValue
            { type: `UINT8`, value: this.table.xAxis.length }, //xResolution
            { type: `UINT8`, value: this.table.yAxis.length }, //yResolution
            { type: `UINT8`, value: typeId }, //Type
            { type: type, value: this.table.value }, //Table
        ]}, this)
    }},
    { type: `Calculation_LookupTable`, toDefinition() {
        if(this.parameterSelection?.reference)
            this.inputVariables = [this.parameterSelection.reference]

        const type = GetArrayType(this.table.value)
        const typeId = GetTypeId(type)
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LookupTable }, //factory ID
            { type: `FLOAT`, value: this.table.xAxis[0] }, //MinXValue
            { type: `FLOAT`, value: this.table.xAxis[this.table.xAxis.length-1] }, //MaxXValue
            { type: `UINT8`, value: this.table.xAxis.length }, //xResolution
            { type: `UINT8`, value: typeId }, //Type
            { type: type, value: this.table.value }, //Table
        ]}, this)
    }},
    { type: `Calculation_Polynomial`, toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: `FLOAT`, value: this.minValue}, //MinValue
            { type: `FLOAT`, value: this.maxValue}, //MaxValue
            { type: `UINT8`, value: this.coeffecients.length}, //Degree
            { type: `FLOAT`, value: this.coeffecients}, //coefficients
        ]}, this)
    }},
    { type: `CalculationOrVariableSelection`, toDefinition() {
        if(!this.selection)
            return
        if(this.selection.reference){
            VariableRegister.RegisterVariable(this.result ?? this.outputVariables?.[0], undefined, this.selection.reference)
            return
        }

        this.calculation.type = this.selection.value
        return Packagize(this.calculation, this)
    }},
    { type: `Calculation_Add`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Add) }},
    { type: `Calculation_Subtract`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Subtract) }},
    { type: `Calculation_Multiply`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Multiply) }},
    { type: `Calculation_Divide`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Divide) }},
    { type: `Calculation_And`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.And) }},
    { type: `Calculation_Or`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Or) }},
    { type: `Calculation_GreaterThan`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.GreaterThan) }},
    { type: `Calculation_LessThan`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.LessThan) }},
    { type: `Calculation_Equal`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Equal) }},
    { type: `Calculation_GreaterThanOrEqual`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.GreaterThanOrEqual) }},
    { type: `Calculation_LessThanOrEqual`, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.LessThanOrEqual) }},
    { type: `CylinderAirmass_SpeedDensity`, toDefinition() {
        this.inputVariables = [ 
            `EngineParameters.Cylinder Air Temperature`,
            `EngineParameters.Manifold Absolute Pressure`,
            `EngineParameters.Volumetric Efficiency`
        ]
        return Packagize({ type: `definition`, value: [ 
            { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.CylinderAirMass_SD },  //factory id
            { type: `FLOAT`, value: this.CylinderVolume }, //Cylinder Volume
        ]}, this)
    }},
    { type: `InjectorPulseWidth_DeadTime`, toDefinition() {
        return { type: `Group`, value: [
            this.FlowRateConfigOrVariableSelection,
            this.DeadTimeConfigOrVariableSelection,
            //Store a value of 2 into the temporary variable which will be used for SquirtsPerCycle (2 squirts per cycle default)
            { type: `Calculation_Static`, value: 2, result: `temp` },//static value of 2
            //Subtract 1 to temporary variable if Engine is running sequentially. This will be used for SquirtsPerCycle (1 squirts per cycle when sequential)
            { 
                type: `Calculation_Subtract`,
                result: `temp`, //Return
                a: `temp`,
                b: `EngineSequentialId`
            },
            { 
                type: `Package`,
                value: [ 
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.InjectorDeadTime },
                    { type: `FLOAT`, value: this.MinInjectorFuelMass }
                ],
                outputVariables: [ this.result ?? this.outputVariables?.[0] ], //Return
                inputVariables: [ 
                    `temp`,
                    `FuelParameters.Cylinder Fuel Mass`,
                    `FuelParameters.Injector Flow Rate`,
                    `FuelParameters.Injector Dead Time`
                ]
            }
        ]}
    }},
    { type: `Input_Analog`, toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.AnalogInput}, //factory ID
            { type: `UINT16`, value: this.pin}, //pin
        ]}, this)
    }},
    { type: `Input_Digital`, toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalInput}, //factory ID
            { type: `UINT16`, value: this.pin}, //pin
            { type: `BOOL`, value: this.inverted}, //inverted
        ]}, this)
    }},
    { type: `Input_DigitalRecord`, toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalPinRecord}, //factory ID
            { type: `UINT16`, value: this.pin}, //pin
            { type: `BOOL`, value: this.inverted}, //inverted
            { type: `UINT16`, value: this.length}, //length
        ]}, this)
    }},
    { type: `Input_DutyCycle`, toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DutyCyclePinRead}, //factory ID
            { type: `UINT16`, value: this.pin}, //pin
            { type: `UINT16`, value: this.minFrequency}, //minFrequency
        ]}, this)
    }},
    { type: `Input_Frequency`, toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.FrequencyPinRead}, //factory ID
            { type: `UINT16`, value: this.pin}, //pin
            { type: `UINT16`, value: this.minFrequency}, //minFrequency
        ]}, this)
    }},
    { type: `Input_PulseWidth`, toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.PulseWidthPinRead}, //factory ID
            { type: `UINT16`, value: this.pin}, //pin
            { type: `UINT16`, value: this.minFrequency}, //minFrequency
        ]}, this)
    }},
    { type: `Output_Digital`, toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalOutput }, //variable
            { type: `UINT16`, value: this.pin },
            { type: `UINT8`, value: this.inverted | (this.highZ? 0x02 : 0x00) }
        ]}, this)
    }},
    { type: `Reluctor_GM24x`, toDefinition() {
        let result = this.result ?? this.outputVariables?.[0];
        return ReluctorTemplate(
            this,
            `${result}(Record)`,
            Packagize(
                { type: `definition`, value: [
                    { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.GM24X}, //factory ID
                ]}, { 
                    outputVariables: [ `${result}(Reluctor)` ], 
                    inputVariables: [ 
                        `${result}(Record)`,
                        `CurrentTickId`
                ]
            })
        )
    }},
    { type: `Reluctor_Universal1x`, toDefinition() {
        let result = this.result ?? this.outputVariables?.[0];
        return ReluctorTemplate(
            this,
            `${result}(Record)`,
            Packagize(
                { type: `definition`, value: [ 
                    { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.Universal1X}, //factory ID
                    { type: `FLOAT`, value: this.risingPosition}, //RisingPosition
                    { type: `FLOAT`, value: this.fallingPosition} //FallingPosition
                ]}, { 
                    outputVariables: [ `${result}(Reluctor)` ], 
                    inputVariables: [ 
                        `${result}(Record)`,
                        `CurrentTickId`
                ]
            })
        )
    }},
    { type: `Reluctor_UniversalMissingTeeth`, toDefinition() {
        let result = this.result ?? this.outputVariables?.[0];
        return ReluctorTemplate(
            this,
            `${result}(Record)`,
            Packagize(
                { type: `definition`, value: [ 
                    { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.UniversalMissintTooth}, //factory ID
                    { type: `FLOAT`, value: this.firstToothPosition}, //FirstToothPosition
                    { type: `FLOAT`, value: this.toothWidth}, //ToothWidth
                    { type: `UINT8`, value: this.numberOfTeeth}, //NumberOfTeeth
                    { type: `UINT8`, value: this.numberOfTeethMissing} //NumberOfTeethMissing
                ]}, { 
                    outputVariables: [ `${result}(Reluctor)` ], 
                    inputVariables: [ 
                        `${result}(Record)`,
                        `CurrentTickId`
                ]
            })
        )
    }},
]

for(var index in STM32TypeAlignment) {
    var type = types.find(x => x.type == x86TypeAlignment[index].type)
    if(type){
        type.align = x86TypeAlignment[index].align
    }
}




