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
    GetVariableByReference(reference) {
        if(!reference || typeof reference !== `object`) return

        let variable
        //variable is contained in a list
        const dotIndex = reference.name.indexOf(`.`)
        if(dotIndex !== -1) {
            const listName = reference.name.substring(0, dotIndex)
            if(!this[listName]) return
            variable = { name: reference.name.substring(dotIndex + 1) }

            variable = this[listName].find(a => 
                a.name === variable.name && 
                (reference.unit === undefined || a.unit === reference.unit || (a.unit === undefined && typeof a.id === `string`)) && 
                (reference.type === undefined || (a.unit !== undefined && reference.type.split(`|`).indexOf(`float`) !== -1) || a.type?.split(`|`).some(t => reference.type.split(`|`).indexOf(t) !== -1) || (a.type === undefined && typeof a.id === `string`)))
        //variable is an object in this
        } else if (typeof this[reference.name] === `object`) {
            variable = this[reference.name]
        //variable points indirectly to another variable by name or is directly the id
        } else if (typeof this[reference.name] === `string`, typeof this[reference.name] === `number`) {
            variable = { name: reference.name, id: this[reference.name] }
        }

        if(variable) {
            if(typeof variable.id === `string`)
                return { ...this.GetVariableByReference({ name: variable.id, unit: reference.unit ?? variable.unit, type: reference.type ?? variable.type }), name: variable.name }
            return variable
        }
    }
    GetVariableId(reference) {
        let variable = this.GetVariableByReference(reference)
        if(variable) return variable.id
        if(!this.CreateIfNotFound) return
        reference = { ...reference }

        //create variable since it was not found
        reference.id ??= this.GenerateVariableId()

        const dotIndex = reference.name.indexOf(`.`)
        if(dotIndex !== -1) {
            const listName = reference.name.substring(0, dotIndex)
            this[listName] ??= []
            reference.name = reference.name.substring(dotIndex + 1)

            this[listName].push(reference)
        } else {
            this[reference.name] = reference
        }
        return reference.id
    }
    RegisterVariable(reference) {
        if(!reference || typeof reference !== `object` || !reference.name) return
        reference = { ...reference }

        const dotIndex = reference.name.indexOf(`.`)
        if(dotIndex !== -1) {
            const listName = reference.name.substring(0, dotIndex)
            this[listName] ??= []
            reference.name = reference.name.substring(dotIndex + 1)

            const existingIndex = this[listName].findIndex(a => 
                a.name === reference.name && 
                (reference.unit === undefined || a.unit === reference.unit || (a.unit === undefined && typeof a.id === `string`)) && 
                (reference.type === undefined || (a.unit !== undefined && reference.type.split(`|`).indexOf(`float`) !== -1) || a.type.split(`|`).some(t => reference.type.split(`|`).indexOf(t) !== -1) || (a.type === undefined && typeof a.id === `string`)))
            if(existingIndex !== -1) {
                reference.id ??= this[listName][existingIndex].id
                this[listName].splice(existingIndex, 1)
            }
            reference.id ??= this.GenerateVariableId()
            this[listName].push(reference)
        } else {
            reference.id ??= this.GenerateVariableId()
            this[reference.name] = reference
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
    
                for (var i = 0; i < this[property].length; i++) {
                    let reference = { ...this[property][i] }
                    reference.name = `${property}.${reference.name}`
                    variableReferences[property].push(this.GetVariableByReference(reference))
                }
            } else {
                variableReferences[property] = this.GetVariableByReference(this[property])
            }
        }
        return variableReferences
    }
}
VariableRegister = new VariableRegistry()

function defaultFilter(outputUnits, outputTypes, inputTypes, inputUnits) {
    return function(calcOrVar) {
        //variable filter
        if(calcOrVar.type || calcOrVar.unit) {
            if(inputTypes || inputUnits) return false
            if(outputUnits?.[0] !== undefined) {
                if(outputUnits.length !== 1) return false
                if(calcOrVar.unit !== outputUnits[0]) return false
            } else if(outputTypes?.[0] !== undefined){
                if(outputTypes.length !== 1) return false
                if(calcOrVar.unit === undefined && calcOrVar.type === undefined ) return false
                if(calcOrVar.unit !== undefined && outputTypes[0].split(`|`).indexOf(`float`) === -1) return false
                if(calcOrVar.type !== undefined && !outputTypes[0].split(`|`).some(t => calcOrVar.type.split(`|`).indexOf(t) !== -1)) return false
            }
            return true
        }

        //calculation Filter
        for(let i = 0; i < (outputUnits?.length ?? outputTypes?.length); i++){
            if(outputUnits?.[i] !== undefined && outputUnits[i] !== ``) {
                if((calcOrVar.outputTypes?.[i]?.split(`|`).indexOf(`float`) ?? -1) === -1 && outputUnits[i] !== calcOrVar.outputUnits?.[i]) return false
            } else if(outputTypes?.[i] !== undefined){
                if(calcOrVar.outputUnits?.[i] === undefined && calcOrVar.outputTypes?.[i] === undefined) false
                if(calcOrVar.outputUnits?.[i] !== undefined && outputTypes[i].split(`|`).indexOf(`float`) === -1) return false
                if(calcOrVar.outputTypes?.[i] !== undefined && !outputTypes[i].split(`|`).some(t => calcOrVar.outputTypes[i].split(`|`).indexOf(t) !== -1)) return false
            }
        }

        for(let i = 0; i < (inputUnits?.length ?? inputTypes?.length); i++){
            if(inputUnits?.[i] !== undefined) {
                if((calcOrVar.inputTypes?.[i]?.split(`|`).indexOf(`float`) ?? -1) === -1 && inputUnits[i] !== calcOrVar.inputUnits?.[i]) return false
            } else if(inputTypes?.[i] !== undefined){
                if(calcOrVar.inputUnits?.[i] === undefined && calcOrVar.inputTypes?.[i] === undefined) false
                if(calcOrVar.inputUnits?.[i] !== undefined && inputTypes[i].split(`|`).indexOf(`float`) === -1) return false
                if(calcOrVar.inputTypes?.[i] !== undefined && !inputTypes[i].split(`|`).some(t => calcOrVar.inputTypes[i].split(`|`).indexOf(t) !== -1)) return false
            }
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
                        value: calculations[i].name
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
                    info: arr[i].unit? `[${GetMeasurementNameFromUnitName(arr[i].unit)}]` : ``,
                    value: { 
                        name: `${property}.${arr[i].name}`,
                        ...( arr[i].type === undefined? undefined :{ type: arr[i].type } ),
                        ...( arr[i].unit === undefined? undefined :{ unit: arr[i].unit } )
                    }
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

OperationArchitectureFactoryIDs = {
    Offset: 10000,
    Package: 0,
    Group: 1,
    Table: 2,
    LookupTable: 3,
    Polynomial: 4,
    Static: 5,
    FaultDetection: 6,
    Add: 10,
    Subtract: 11,
    Multiply: 12,
    Divide: 13,
    And: 14,
    Or: 15,
    GreaterThan: 16,
    LessThan: 17,
    Equal: 18,
    GreaterThanOrEqual: 19,
    LessThanOrEqual: 20
}
EmbeddedOperationsFactoryIDs = {
    Offset: 20000,
    AnalogInput: 1,
    DigitalInput: 2,
    DigitalPinRecord: 3,
    DutyCyclePinRead: 4,
    FrequencyPinRead: 5,
    PulseWidthPinRead: 6,
    DigitalOutput: 7,
    PulseWidthPinWrite: 8,
    GetTick: 9,
    SecondsToTick: 10,
    TickToSeconds: 11
}
ReluctorFactoryIDs = {
    Offset: 30000,
    GM24X: 1,
    Universal1X: 2,
    UniversalMissintTooth: 3
}
EngineFactoryIDs = {
    Offset : 40000,
    CylinderAirMass_SD: 1,
    InjectorPrime: 2,
    PositionCrankPriority: 3,
    PositionCamPriority: 4,
    EngineParameters: 5,
    ScheduleIgnition: 6,
    ScheduleInjection: 7,
    InjectorDeadTime: 8
}

function GetArrayType(tableValue) {
    var min = 9000000000000000
    var max = -9000000000000000
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
    val ??= {}
    val.outputVariables ??= this.outputVariables
    val.outputUnits = val.unit === undefined? val.outputUnits : [val.unit]
    val.outputUnits ??= this.unit === undefined? this.outputUnits : [this.unit]
    val.outputVariables = val.outputVariables?.map(function(ov, idx) {
        if(typeof ov !== `string`)
            return ov

        let unit = ov.substring(ov.indexOf(`(`) > -1? ov.indexOf(`(`)+1 : ov.length)
        if(unit.indexOf(`)`) > 0)
        {
            unit = unit.substring(0, unit.indexOf(`)`))
            val.outputUnits ??= []
            val.outputUnits[idx] ??= unit
        }

        let variableReference = ov.substring(0, ov.indexOf(`(`) > -1? ov.indexOf(`(`) : ov.length)
        return variableReference
    })
    val.inputVariables ??= this.inputVariables
    delete val.unit
    if( (val.outputVariables && val.outputVariables.some(x => x !== undefined)) || 
        (val.intputVariables && val.intputVariables.some(x => x !== undefined))) {
        definition.type = `Package`
        definition.outputVariables = val.outputVariables
        definition.outputUnits = val.outputUnits
        definition.inputVariables = val.inputVariables
        return { type: `definition`, value: [ definition ] }
    }
    return definition
}

function Calculation_Math(mathFactoryId) {
    if(this.outputVariables || this.inputVariables){
        this.inputVariables ??= [0,0]
        this.outputVariables ??= [0]
    }

    return Packagize({ type: `definition`, value: [ { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + mathFactoryId } ]}, this)
}

function ReluctorTemplate(definition) {
    const recordVariable = { name: this.outputVariables?.[0]?.name, type: `Record` }
    let o = { type: `Group`, value: [
        { ...this, type: `Input_DigitalRecord`, outputVariables: [ recordVariable ] },
        Packagize( definition, { 
            ...this,
            inputVariables: [ 
                recordVariable,
                { name: `CurrentTick`, type: `tick` }
            ]
        })
    ]}
    return o
}

function mapDefinitionFromValue(value) {
    const typeInfo = this.types?.find(t => t.type == value.type)
    value = { ...value, ...typeInfo }
    if(value.definition) return value.definition

    if(value.toDefinition) {
        value.types ??= []
        for(let typeIndex in this.types){
            if(value.types.find(x => x.type === this.types[typeIndex].type) === undefined){
                value.types.push(this.types[typeIndex])
            }
        }    

        let definition = value.toDefinition.call(value)
        if(definition === undefined)
            return
        if(definition.type !== `definition`)
            definition = { type: `definition`, value: [definition]}
        return definition.value.flatMap(v => mapDefinitionFromValue.call(value, v))
    }
    return value
}
function toDefinition() {
    let definitions = this.value.flatMap(v => mapDefinitionFromValue.call(this, v))
    return { type: `definition`, value: definitions, types: this.types }
}
function toArrayBuffer() {
    let definition = toDefinition.call(this)
    var buffer = new ArrayBuffer()
    for(var index in definition.value){
        if(definition.value[index] == undefined)
            continue
        var typeInfo = definition.types.find(x => x.type === definition.value[index].type)

        //align
        var align = definition.value[index].align
        if(align === undefined && typeInfo !== undefined){
            align = typeInfo.align
        }
        if(align) {
            buffer = buffer.align(align)
        }

        var toArrayBuffer = definition.value[index].toArrayBuffer
        if(toArrayBuffer === undefined && typeInfo !== undefined && definition.value[index].type !== `definition`){
            toArrayBuffer = typeInfo.toArrayBuffer
        }
        if(toArrayBuffer !== undefined){
            buffer = buffer.concatArray(toArrayBuffer.call(definition.value[index]))
        }
    }
    return buffer
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
    { type: `VariableId`, toDefinition() { 
        return { type: `definition`, value: [
            { type: `UINT32`, value: typeof this.value === `number`? this.value : VariableRegister.GetVariableId(this.value) }
        ]} 
    }},
    { type: `Package`, toDefinition() {
        this.value.unshift({ type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }) //Package
        
        const thisValue = this
        for(let index in this.outputVariables) {
            thisValue.value.push({ type: `VariableId`, value: this.outputVariables?.[index] })
        }

        delete this.outputUnits
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
                definition = [definition]
            for(index in definition)
            {
                if(definition[index] === undefined)
                    continue
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
                    if(newValue[newValue.length - 1]?.type !== `definition`) {
                        newValue.push({ type: `definition`, value: [definition[index]] })
                    } else {
                        newValue[newValue.length - 1].value.push(definition[index])
                    }
                }
            }
        }
        this.value.forEach(reduce)
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
    { type: `Calculation_2AxisTable`, inputs: 2, toDefinition() {
        this.inputVariables ??= [ undefined, undefined ]
        if(this.XSelection)
            this.inputVariables[0] = this.XSelection
        if(this.YSelection)
            this.inputVariables[1] = this.YSelection

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
    { type: `Calculation_LookupTable`, inputs: 1, toDefinition() {
        if(this.parameterSelection)
            this.inputVariables = [this.parameterSelection]

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
    { type: `Calculation_Polynomial`, inputs: 1, toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: `FLOAT`, value: this.minValue}, //MinValue
            { type: `FLOAT`, value: this.maxValue}, //MaxValue
            { type: `UINT8`, value: this.coeffecients.length}, //Degree
            { type: `FLOAT`, value: this.coeffecients}, //coefficients
        ]}, this)
    }},
    { type: `CalculationOrVariableSelection`, toDefinition() {
        if(this.calculation) return { ...this, ...this.calculation, type: this.selection }
        VariableRegister.RegisterVariable({ ...this.selection, ...this.outputVariables?.[0] })
    }},
    { type: `Calculation_Add`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Add) }},
    { type: `Calculation_Subtract`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Subtract) }},
    { type: `Calculation_Multiply`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Multiply) }},
    { type: `Calculation_Divide`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Divide) }},
    { type: `Calculation_And`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.And) }},
    { type: `Calculation_Or`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Or) }},
    { type: `Calculation_GreaterThan`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.GreaterThan) }},
    { type: `Calculation_LessThan`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.LessThan) }},
    { type: `Calculation_Equal`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.Equal) }},
    { type: `Calculation_GreaterThanOrEqual`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.GreaterThanOrEqual) }},
    { type: `Calculation_LessThanOrEqual`, inputs: 2, toDefinition() { return Calculation_Math.call(this, OperationArchitectureFactoryIDs.LessThanOrEqual) }},
    { type: `CylinderAirmass_SpeedDensity`, outputUnits: [`g`], toDefinition() {
        this.inputVariables = [ 
            { name: `EngineParameters.Cylinder Air Temperature` },
            { name: `EngineParameters.Manifold Absolute Pressure` },
            { name: `EngineParameters.Volumetric Efficiency` }
        ]
        return Packagize({ type: `definition`, value: [ 
            { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.CylinderAirMass_SD },  //factory id
            { type: `FLOAT`, value: this.CylinderVolume }, //Cylinder Volume
        ]}, this)
    }},
    { type: `InjectorPulseWidth_DeadTime`, outputUnits: [`s`], toDefinition() {
        return { type: `Group`, value: [
            { ...this.FlowRateConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `FuelParameters.Injector Flow Rate` } ] },
            { ...this.DeadTimeConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `FuelParameters.Injector Dead Time` } ] },
            //Store a value of 2 into the temporary variable which will be used for SquirtsPerCycle (2 squirts per cycle default)
            { type: `Calculation_Static`, value: 2, outputVariables: [ { name: `temp` } ] },//static value of 2
            //Subtract 1 to temporary variable if Engine is running sequentially. This will be used for SquirtsPerCycle (1 squirts per cycle when sequential)
            { 
                type: `Calculation_Subtract`,
                outputVariables: [ { name: `temp` } ], //Return
                inputVariables: [
                    { name: `temp` },
                    { name: `EngineSequentialId` }
                ]
            },
            Packagize({ type: `definition`, value: [ 
                { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.InjectorDeadTime },
                { type: `FLOAT`, value: this.MinInjectorFuelMass }
            ]},{
                ...this,
                inputVariables: [ 
                    { name: `temp` },
                    { name: `FuelParameters.Cylinder Fuel Mass` },
                    { name: `FuelParameters.Injector Flow Rate` },
                    { name: `FuelParameters.Injector Dead Time` }
                ]
            })
        ]}
    }},
    { type: `Input_Analog`, outputUnits: [`V`], toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.AnalogInput}, //factory ID
            { type: `UINT16`, value: this.pin}, //pin
        ]}, this)
    }},
    { type: `Input_AnalogPolynomial`, toDefinition() {
        const analogInputOutputVariable = { name: this.outputVariables[0].name, unit: `V` }
        return { type: `Group`, value: [
            { ...this.analogInput, type: `Input_Analog`, outputVariables: [ analogInputOutputVariable ]},
            { ...this.polynomial, type: `Calculation_Polynomial`, outputVariables: this.outputVariables, inputVariables: [ analogInputOutputVariable ] }
        ]}
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
    { type: `Input_DutyCycle`, outputUnits: [`%`], toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DutyCyclePinRead}, //factory ID
            { type: `UINT16`, value: this.pin}, //pin
            { type: `UINT16`, value: this.minFrequency}, //minFrequency
        ]}, this)
    }},
    { type: `Input_Frequency`, outputUnits: [`Hz`], toDefinition() {
        return Packagize({ type: `definition`, value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.FrequencyPinRead}, //factory ID
            { type: `UINT16`, value: this.pin}, //pin
            { type: `UINT16`, value: this.minFrequency}, //minFrequency
        ]}, this)
    }},
    { type: `Input_PulseWidth`, outputUnits: [`s`], toDefinition() {
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
        return ReluctorTemplate.call(
            this,
            { type: `definition`, value: [
                { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.GM24X}, //factory ID
            ]}
        )
    }},
    { type: `Reluctor_Universal1x`, toDefinition() {
        return ReluctorTemplate.call(
            this,
            { type: `definition`, value: [ 
                { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.Universal1X}, //factory ID
                { type: `FLOAT`, value: this.risingPosition}, //RisingPosition
                { type: `FLOAT`, value: this.fallingPosition} //FallingPosition
            ]}
        )
    }},
    { type: `Reluctor_UniversalMissingTeeth`, toDefinition() {
        return ReluctorTemplate.call(
            this,
            { type: `definition`, value: [ 
                { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.UniversalMissintTooth}, //factory ID
                { type: `FLOAT`, value: this.firstToothPosition}, //FirstToothPosition
                { type: `FLOAT`, value: this.toothWidth}, //ToothWidth
                { type: `UINT8`, value: this.numberOfTeeth}, //NumberOfTeeth
                { type: `UINT8`, value: this.numberOfTeethMissing} //NumberOfTeethMissing
            ]}
        )
    }},
    { type: `MAP_GM1Bar`, toDefinition() {
        this.type = `Input_AnalogPolynomial`
        return this
    }},
    { type: `MAP_GM2Bar`, toDefinition() {
        this.type = `Input_AnalogPolynomial`
        return this
    }},
    { type: `MAP_GM3Bar`, toDefinition() {
        this.type = `Input_AnalogPolynomial`
        return this
    }},
    { type: `Input`, toDefinition() {
        if(this.translationConfig === undefined)
            return
        const translationOutputVariable = { name: `Inputs.${this.name}`, unit: this.translationConfig.calculation?.outputUnits?.[0], type: this.translationConfig.calculation?.outputUnits?.[0] === undefined? this.translationConfig.calculation?.outputTypes?.[0] : undefined }

        if(this.translationConfig.inputs === undefined || this.translationConfig.inputs === 0)
            return { ...this.translationConfig, type: `CalculationOrVariableSelection`, outputVariables: [ translationOutputVariable ] }

        const rawOutputVariable = { name: `Inputs.${this.name}`, unit: this.rawConfig.calculation?.outputUnits?.[0], type: this.rawConfig.calculation?.outputUnits?.[0] === undefined? this.rawConfig.calculation?.outputTypes?.[0] : undefined }
        this.rawConfig = { ...this.rawConfig, type: `CalculationOrVariableSelection`, outputVariables: [ rawOutputVariable ] }
        
        return { type: `Group`, value: [
            { ...this.rawConfig, type: `CalculationOrVariableSelection` },
            { ...this.translationConfig, type: `CalculationOrVariableSelection`, outputVariables: [ translationOutputVariable ], inputVariables: [ rawOutputVariable ] }
        ]}
    }},
    { type: `Inputs`, toDefinition() {
        return { type: `Group`, value: [
            { type: `Package`, //Package
                value: [{ type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.GetTick }], //GetTick factory ID
                outputVariables: [ { name: `CurrentTick`, type: `tick` } ]
            }, ...this.inputs.map(function(input) { return { ...input, type: `Input` }})
        ]}
    }},
    { type: `Calculation_Formula`, toDefinition() {
        let operators = [`*`,`/`,`+`,`-`,`>=`,`<=`,`>`,`<`,`=`,`&`,`|`]
        function ParseFormula(formula, parameters) {
            formula = formula.replaceAll(` `, ``)
            for(let i = 0; i < parameters.length; i++) {
                formula = formula.replaceAll(parameters[i], `param${i}`)
            }
            let operations = []
            let tempIndex = 0
    
            //do parenthesis
            let parenthesisFormulas = formula.split(`)`)
            if(parenthesisFormulas.length !== formula.split(`(`).length)
                return `Parenthesis start and end not matching`
    
            while((parenthesisFormulas = formula.split(`)`).filter(p => operators.some(o => p.split(`(`).pop()?.indexOf(o) > -1))).length > 1) {
                tempIndex++
                let tempFormula = parenthesisFormulas[0].split(`(`).pop()
                operations.push({
                    resultInto: `$temp${tempIndex}`,
                    parameters: [tempFormula]
                })
                formula = formula.replace(`(${tempFormula})`, `$temp${tempIndex}`)
            }
            operations.push({
                resultInto: `return`,
                parameters: [formula]
            })
    
            //do operators
            function splitOnOperators(s) {
                for(let operatorIndex in operators) {
                    let operator = operators[operatorIndex]
                    s = s.split(operator).join(`,`)
                }
                return s.split(`,`)
            }
    
            for(let operatorIndex in operators) {
                let operator = operators[operatorIndex]
                let operationIndex
                while((operationIndex = operations.findIndex(f => f.parameters.find(p => p.indexOf(operator) > -1))) > -1) {
                    const formula = operations[operationIndex]
                    const parameterIndex = formula.parameters.findIndex(p => p.indexOf(operator) > -1)
                    const parameter = formula.parameters[parameterIndex]
                    const firstParameter = splitOnOperators(parameter.split(operator)[0]).pop()
                    const secondParameter = splitOnOperators(parameter.split(operator)[1])[0]
                    if(formula.parameters.length > 1 || splitOnOperators(formula.parameters[0].replace(`${firstParameter}${operator}${secondParameter}`, `temp`)).length > 1) {
                        tempIndex++
                        formula.parameters[parameterIndex] = parameter.replace(`${firstParameter}${operator}${secondParameter}`, `$temp${tempIndex}`)
                        operations.splice(operationIndex, 0, {
                            operator,
                            resultInto: `$temp${tempIndex}`,
                            parameters: [firstParameter, secondParameter]
                        })
                    } else {
                        operations[operationIndex].operator = operator
                        operations[operationIndex].parameters = [firstParameter, secondParameter]
                    }
                }
            }
    
            //statics
            let operationIndex
            while((operationIndex = operations.findIndex(f => f.operator !== `s` && f.parameters.find(p => p.match(/^[0-9]+$/)))) > -1) {
                const formula = operations[operationIndex]
                const parameterIndex = formula.parameters.findIndex(p => p.match(/^[0-9]+$/))
                const parameter = formula.parameters[parameterIndex]
    
                tempIndex++
                operations[operationIndex].parameters[parameterIndex] = `$temp${tempIndex}`
                operations.splice(operationIndex, 0, {
                    operator: `s`,
                    resultInto: `$temp${tempIndex}`,
                    parameters: [parameter]
                })
            }
    
            //consolidate temp variables
            tempIndex = 0
            for(let operationIndex in operations) {
                operationIndex = parseInt(operationIndex)
                let formula = operations[operationIndex]
                if(formula.resultInto.indexOf(`$temp`) !== 0)
                    continue
                let nextFormulaParameterIndex
                if  (operations.filter(f => f.parameters.findIndex(p => p === formula.resultInto) > -1).length < 2 && 
                    (nextFormulaParameterIndex = operations[operationIndex+1]?.parameters?.findIndex(p => p === formula.resultInto)) > -1) {
                        operations[operationIndex+1].parameters[nextFormulaParameterIndex] = formula.resultInto = `temp`
                } else {
                    tempIndex++
                    operations.filter(f => f.parameters.findIndex(p => p === formula.resultInto) > -1).forEach(function(f) { for(let parameterIndex in f.parameters) {
                        if(f.parameters[parameterIndex] === formula.resultInto) 
                            f.parameters[parameterIndex] = `temp${tempIndex}`
                    } })
                    formula.resultInto = `temp${tempIndex}`
                }
            }
    
            for(let i = 0; i < operations.length; i++) {
                operations[i].parameters
                for(let p = 0; p < operations[i].parameters.length; p++) {
                    if(operations[i].parameters[p].indexOf(`param`) === 0) {
                        operations[i].parameters[p] = parameters[parseInt(operations[i].parameters[p].substring(5))]
                    }
                }
            }

            return operations
        }
        let parameters = this.formula.replaceAll(` `, ``)
        for(let operatorIndex in operators) {
            let operator = operators[operatorIndex]
            parameters = parameters.split(operator).join(`,`)
        }
        let parameterSplit = parameters.split(`,`)
        let operatorSplit = this.formula.replaceAll(` `, ``)
        for(let i = 0; i < parameterSplit.length; i++) {
            let loc = operatorSplit.indexOf(parameterSplit[i])
            operatorSplit = operatorSplit.substring(0, loc) + `,` + operatorSplit.substring(loc + parameterSplit[i].length)
        }
        operatorSplit = operatorSplit.split(`,`)
        parameters = ``
        for(let i = 0; i < parameterSplit.length; i++) {
            if(parameters !== ``) parameters += `,`
            parameters += parameterSplit[i]

            if(parameterSplit[i].match(/[^,][(]/) && parameterSplit[i][parameterSplit[i].length - 1] !== `)`) {
                while(++i < parameterSplit.length) {
                    parameters += operatorSplit[i] + parameterSplit[i]
                    if(parameterSplit[i][parameterSplit[i].length - 1] === `)`) break
                }
            }
        }
        parameters = parameters.split(`,`).filter(s => !s.match(/^[0-9]*$/))
        parameters = parameters.map(s => s[0] === `(` ? s.substring(1) : s)
        parameters = parameters.map(s => s[s.length-1] === `)` && s.split(`)`).length > s.split(`(`).length? s.substring(0, s.length-1) : s)
        parameters = parameters.filter(s => s.length !== 0)
        if(parameters.length === 0)
            return
        const operations = ParseFormula(this.formula, parameters)
        if(operations.length == 0 || (operations.length == 1 && operations[0].operator == undefined)) 
            return { ...this.parameterValues[parameters[0]], type: `CalculationOrVariableSelection`, outputVariables: this.outputVariables }
        var group  = { 
            type: `Group`, 
            value: []
        }
        
        const thisClass = this
        let resultName = this.outputVariables?.[0]?.name
        parameters.forEach(function(parameter) { 
            let name = parameter.indexOf(`temp`) === 0 ? parameter : `${resultName}_${parameter}`
            name = name.substring(0, name.indexOf(`(`) !== -1? name.indexOf(`(`) : name.length)
            group.value.push({ ...thisClass.parameterValues[parameter], type: `CalculationOrVariableSelection`, outputVariables: [ { name } ] }) 
        })
        for(let operationIndex in operations) {
            let operation = operations[operationIndex]
            let operationValue = { outputVariables: operation.resultInto === `return`? this.outputVariables : [ { name: operation.resultInto } ] }
            if(operation.operator === `s`) {
                operationValue.type = `Calculation_Static`
                operationValue.value = operation.parameters[0]
            } else {
                operationValue.inputVariables = operation.parameters.map(function(parameter) { 
                    let name = parameter.indexOf(`temp`) === 0 ? parameter : `${resultName}_${parameter}`
                    name = name.substring(0, name.indexOf(`(`) !== -1? name.indexOf(`(`) : name.length)
                    return { name } 
                })
                switch(operation.operator) {
                    case `*`: 
                        operationValue.type = `Calculation_Multiply`
                        break
                    case `/`: 
                        operationValue.type = `Calculation_Divide`
                        break
                    case `+`: 
                        operationValue.type = `Calculation_Add`
                        break
                    case `-`: 
                        operationValue.type = `Calculation_Subtract`
                        break
                    case `>=`: 
                        operationValue.type = `Calculation_GreaterThanOrEqual`
                        break
                    case `<=`: 
                        operationValue.type = `Calculation_LessThanOrEqual`
                        break
                    case `>`: 
                        operationValue.type = `Calculation_GreaterThan`
                        break
                    case `<`: 
                        operationValue.type = `Calculation_LessThan`
                        break
                    case `=`: 
                        operationValue.type = `Calculation_Equal`
                        break
                    case `&`: 
                        operationValue.type = `Calculation_And`
                        break
                    case `|`: 
                        operationValue.type = `Calculation_Or`
                        break
                }
            }
            group.value.push(operationValue)
        }
        
        return group
    }},
    { type: `Fuel`, toDefinition() {
        var group = { 
            types : [{ type: `Calculation_EngineScheduleInjection`, toDefinition() {
                return { type: `definition`, value: [ {
                    type: `Package`,
                    value: [ 
                        { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleInjection }, //factory id
                        { type: `FLOAT`, value: this.value.TDC }, //tdc
                        { ...this.value, type: `CalculationOrVariableSelection` },
                    ],
                    outputVariables: [ 
                        { name: `temp` }, //store in temp variable
                        { name: `temp` } //store in temp variable
                    ],
                    inputVariables: [
                        { name: `EnginePositionId` },
                        { name: `FuelParameters.Injector Enable` },
                        { name: `FuelParameters.Injector Pulse Width` },
                        { name: `FuelParameters.Injector End Position` }
                    ]
                }]}
            }}],
            type: `Group`, 
            value: [
                { ...this.AFRConfigOrVariableSelection, type: `Calculation_Formula`, outputVariables: [ { name: `FuelParameters.Air Fuel Ratio` } ] }, 

                { 
                    type: `Calculation_Divide`,
                    outputVariables: [ { name: `FuelParameters.Cylinder Fuel Mass` } ],
                    inputVariables: [
                        { name: `EngineParameters.Cylinder Air Mass` },
                        { name: `FuelParameters.Air Fuel Ratio` }
                    ]
                },

                { ...this.InjectorEnableConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `FuelParameters.Injector Enable` } ] }, 
                { ...this.InjectorPulseWidthConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `FuelParameters.Injector Pulse Width` } ] }, 
                { ...this.InjectorEndPositionConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `FuelParameters.Injector End Position` } ] }
            ]
        }

        for(var i = 0; i < this.Outputs.length; i++) {
            group.value.push({ type: `Calculation_EngineScheduleInjection`, value: this.Outputs[i] })
        }

        return group
    }},
    { type: `Ignition`, toDefinition() {
        var group  = { 
            types : [{ type: `Calculation_EngineScheduleIgnition`, toDefinition() {
                return { type: `definition`, value: [ {
                    type: `Package`,
                    value: [ 
                        { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleIgnition }, //factory id
                        { type: `FLOAT`, value: this.value.TDC }, //tdc
                        { ...this.value, type: `CalculationOrVariableSelection` },
                    ],
                    outputVariables: [ 
                        { name: `temp` }, //store in temp variable
                        { name: `temp` } //store in temp variable
                    ],
                    inputVariables: [
                        { name: `EnginePositionId` },
                        { name: `IgnitionParameters.Ignition Enable` },
                        { name: `IgnitionParameters.Ignition Dwell` },
                        { name: `IgnitionParameters.Ignition Advance` },
                        { name: `IgnitionParameters.Ignition Dwell Deviation` }
                    ]
                }]}
            }}],
            type: `Group`, 
            value: [
                { ...this.IgnitionEnableConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `IgnitionParameters.Ignition Enable` } ] }, 
                { ...this.IgnitionAdvanceConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `IgnitionParameters.Ignition Advance` } ] },
                { ...this.IgnitionDwellConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `IgnitionParameters.Ignition Dwell` } ] },
                { ...this.IgnitionDwellDeviationConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `IgnitionParameters.Ignition Dwell Deviation` } ] }
            ]
        }

        for(var i = 0; i < this.Outputs.length; i++) {
            group.value.push({ type: `Calculation_EngineScheduleIgnition`, value: this.Outputs[i] })
        }

        return group
    }},
    { type: `Engine`, toDefinition() {
        let mapRequired = (this.requirements?.indexOf(`Manifold Absolute Pressure`) ?? -1) !== -1
        let catRequired = (this.requirements?.indexOf(`Cylinder Air Temperature`) ?? -1) !== -1
        let veRequired  = (this.requirements?.indexOf(`Volumetric Efficiency`) ?? -1) !== -1

        var group = { type: `Group`, value: [
            { ...this.CrankPositionConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `EngineParameters.Crank Position` } ] },
            { ...this.CamPositionConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `EngineParameters.Cam Position` } ] },

            //CalculateEnginePosition
            { 
                type: `Package`,
                value: [ 
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + ( this.CrankPriority? EngineFactoryIDs.PositionCrankPriority : EngineFactoryIDs.PositionCamPriority) },  //factory id
                ],
                outputVariables: [ { name: `EnginePositionId` } ],
                inputVariables: [
                    { name: `EngineParameters.Crank Position` },
                    { name: `EngineParameters.Cam Position` }
                ]
            },

            //EngineParameters
            { 
                type: `Package`,
                value: [ 
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.EngineParameters },  //factory id
                ],
                outputVariables: [ 
                    { name: `EngineParameters.Engine Speed` },
                    { name: `EngineSequentialId` },
                    { name: `EngineSyncedId` }
                ],
                inputVariables: [ { name: `EnginePositionId` } ]
            }
        ]}
        
        if(mapRequired) {
            group.value.push({ ...this.ManifoldAbsolutePressureConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `EngineParameters.Manifold Absolute Pressure` } ] })
        }

        if(catRequired) {
            group.value.push({ ...this.CylinderAirTemperatureConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `EngineParameters.Cylinder Air Temperature` } ] })
        }
        
        if(veRequired) {
            group.value.push({ ...this.VolumetricEfficiencyConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `EngineParameters.Volumetric Efficiency` } ] })
        }
        
        group.value.push({ ...this.CylinderAirmassConfigOrVariableSelection, type: `CalculationOrVariableSelection`, outputVariables: [ { name: `EngineParameters.Cylinder Air Mass` } ] })

        return group
    }},
    { type: `Top`, toDefinition() {
        return { type: `definition`, value: [
            { type: `UINT32`, value: 0}, //signal last operation

            //inputs
            { type: `Group`, value: [
                { ...this.Inputs, type: `Inputs` }, 
                { ...this.Engine, type: `Engine` },
            ]},

            //preSync
            { type: `Group`, value: [ ] },

            //sync condition
            { type: `Group`, value: [ 
                { type: `Calculation_Static`, value: false, outputVariables: [ { name: `temp` } ] }, //store static variable in temp variable
                { type: `Calculation_Or`, inputVariables: [ { name: `EngineSyncedId` }, { name: `temp` } ] },
            ]},

            //main loop execute
            { type: `Group`, value: [ 
                { ...this.Fuel, type: `Fuel` },
                { ...this.Ignition, type: `Ignition` }
            ]},
        ]}
    }, toArrayBuffer() {
        let buf = new ArrayBuffer()
        buf = buf.build({ type:`definition`, value: [ this ], types: types })
        buf = new Uint32Array([buf.byteLength]).buffer.concatArray(buf)
        buf = buf.concatArray(new Uint32Array([buf.crc32()]).buffer)

        let bufMeta = base64ToArrayBuffer(lzjs.compressToBase64(stringifyObject(VariableRegister.GetVariableReferenceList())))
        bufMeta = new Uint32Array([bufMeta.byteLength]).buffer.concatArray(bufMeta)
        bufMeta = bufMeta.concatArray(new Uint32Array([bufMeta.crc32()]).buffer)

        return buf.concatArray(bufMeta)
    }},
]

for(var index in STM32TypeAlignment) {
    var type = types.find(x => x.type == x86TypeAlignment[index].type)
    if(type){
        type.align = x86TypeAlignment[index].align
    }
}




