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
                    var variable = this[listName].find(a => a.Name === variableName);
                    if(variableName.indexOf(`(`) !== -1) {
                        var measurementName = variableName.substring(variableName.lastIndexOf(`(`) + 1);
                        measurementName = measurementName.substring(0, measurementName.length - 1);
                        variableName = variableName.substring(0, variableName.lastIndexOf(`(`));
                        variable ??= this[listName].find(a => a.Name === variableName && a.Measurement === measurementName)
                        variable ??= this[listName].find(a => a.Name === variableName)
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
            var measurement;
            if(variableName.indexOf(`(`) !== -1) {
                var measurement = variableName.substring(variableName.lastIndexOf(`(`) + 1);
                measurement = measurement.substring(0, measurement.length - 1);
                variableName = variableName.substring(0, variableName.lastIndexOf(`(`));
            }
            this[listName] ??= [];
            this[listName].push({
                Name: variableName,
                Measurement: measurement,
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
                    variableReferences[property].push({ Name: arr[i].Name, Measurement: arr[i].Measurement, Id: this.GetVariableId(arr[i].Id)})
                }
            } else {
                variableReferences[property] = this.GetVariableId(this[property]);
            }
        }
        return variableReferences;
    }
}

VariableRegister = new VariableRegistry();

var AFRConfigs = [];
AFRConfigs.push(Calculation_Static);
AFRConfigs.push(Calculation_LookupTable);
AFRConfigs.push(Calculation_2AxisTable);
var InjectorEnableConfigs = [];
InjectorEnableConfigs.push(Calculation_Static);
InjectorEnableConfigs.push(Calculation_LookupTable);
InjectorEnableConfigs.push(Calculation_2AxisTable);
var InjectorPulseWidthConfigs = [];
InjectorPulseWidthConfigs.push(Calculation_Static);
// InjectorPulseWidthConfigs.push(Calculation_LookupTable);
// InjectorPulseWidthConfigs.push(Calculation_2AxisTable);
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
var CylinderAirmassConfigs = [];
CylinderAirmassConfigs.push(Calculation_Static);
var CylinderAirTemperatureConfigs = [];
CylinderAirTemperatureConfigs.push(Calculation_Static);
var ManifoldAbsolutePressureConfigs = [];
ManifoldAbsolutePressureConfigs.push(Calculation_Static);
var VolumetricEfficiencyConfigs = [];
VolumetricEfficiencyConfigs.push(Calculation_Static);
VolumetricEfficiencyConfigs.push(Calculation_LookupTable);
VolumetricEfficiencyConfigs.push(Calculation_2AxisTable);

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

function GetType(value) {
    if(value == undefined)
        return `VOID`;
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

class ConfigTop extends UI.OldTemplate {
    static Template = getFileContents(`ConfigGui/Top.html`);

    constructor(prop){
        super();
        this.Inputs = new ConfigInputs();
        this.Engine = new ConfigEngine();
        this.Fuel = new ConfigFuel();
        this.Ignition = new ConfigIgnition();
        this.Setup(prop);
    }

    get saveValue() {
        return super.saveValue;
    }

    set saveValue(saveValue) {
        super.saveValue = saveValue;
        this.RegisterVariables();
    }

    Detach() {
        super.Detach();

        $(document).off(`click.${this.GUID}`);
    }

    Attach() {
        super.Attach();

        var thisClass = this;
        $(document).on(`click.${this.GUID}`, `#${this.GUID}-sidebar-open`, function(){
            var sidebarSelector = $(`#${thisClass.GUID}-sidebar`);
            var containerSelector = $(`#${thisClass.GUID}-container`);
            var width = sidebarSelector.width();
            var moveamount = 0.005 * width / 0.1;
            var left = containerSelector.position().left;
            sidebarSelector.show();
            sidebarSelector.css(`left`, `${left-width}px`);
            var intervalId = setInterval(function() {
                if (left >= width) {
                    clearInterval(intervalId);
                } else {
                    left += moveamount;
                    containerSelector.css(`left`, `${left}px`);
                    containerSelector.css(`margin-right`, `${left}px`);
                    sidebarSelector.css(`left`, `${left-width}px`);
                    sidebarSelector.css(`opacity`, left / width);
                }
            }, 5);
            $(`#${thisClass.GUID}-sidebar-open`).hide();
        });

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-sidebar-close`, function(){
            var sidebarSelector = $(`#${thisClass.GUID}-sidebar`);
            var containerSelector = $(`#${thisClass.GUID}-container`);
            var width = sidebarSelector.width();
            var moveamount = 0.005 * width / 0.1;
            var left = containerSelector.position().left;
            sidebarSelector.css(`left`, `${left-width}px`);
            var intervalId = setInterval(function() {
                if (left <= 0) {
                    clearInterval(intervalId);
                    sidebarSelector.hide();
                } else {
                    left -= moveamount;
                    containerSelector.css(`left`, `${left}px`);
                    containerSelector.css(`margin-right`, `${left}px`);
                    sidebarSelector.css(`left`, `${left-width}px`);
                    sidebarSelector.css(`opacity`, left / width);
                }
            }, 5);
            $(`#${thisClass.GUID}-sidebar-open`).show();
        });

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-inputstab, #${this.GUID}-inputstablist`, function(e){
            if($(e.target).hasClass(`expand`)) {
                if( $(`#${thisClass.GUID}-inputstablist`).is(`:visible`)) {
                    $(e.target).html(`►&nbsp;`);
                    $(`#${thisClass.GUID}-inputstablist`).hide();
                } else {
                    $(e.target).html(`▼&nbsp;`);
                    $(`#${thisClass.GUID}-inputstablist`).show();
                }
            } else {
                $(`.${thisClass.GUID}-content`).hide();
                $(`#${thisClass.GUID}-inputs`).show();
                $(`#${thisClass.GUID}-inputstab .w3-right`).show();
                $(`#${thisClass.GUID}-sidebar .w3-bar-item`).removeClass(`active`);
                $(`#${thisClass.GUID}-inputstab`).addClass(`active`);
                $(`#${thisClass.GUID}-title`).html(`Inputs`);
            }
        });

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-enginetab`, function(){
            $(`.${thisClass.GUID}-content`).hide();
            $(`#${thisClass.GUID}-engine`).show();
            $(`#${thisClass.GUID}-inputstab .w3-right`).hide();
            $(`#${thisClass.GUID}-sidebar .w3-bar-item`).removeClass(`active`);
            $(`#${thisClass.GUID}-enginetab`).addClass(`active`);
            $(`#${thisClass.GUID}-title`).html(`Engine`);
        });

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-fueltab`, function(){
            $(`.${thisClass.GUID}-content`).hide();
            $(`#${thisClass.GUID}-fuel`).show();
            $(`#${thisClass.GUID}-inputstab .w3-right`).hide();
            $(`#${thisClass.GUID}-sidebar .w3-bar-item`).removeClass(`active`);
            $(`#${thisClass.GUID}-fueltab`).addClass(`active`);
            $(`#${thisClass.GUID}-title`).html(`Fuel`);
        });

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-ignitiontab`, function(){
            $(`.${thisClass.GUID}-content`).hide();
            $(`#${thisClass.GUID}-ignition`).show();
            $(`#${thisClass.GUID}-inputstab .w3-right`).hide();
            $(`#${thisClass.GUID}-sidebar .w3-bar-item`).removeClass(`active`);
            $(`#${thisClass.GUID}-ignitiontab`).addClass(`active`);
            $(`#${thisClass.GUID}-title`).html(`Ignition`);
        });
    }

    GetHtml() {
        var template = super.GetHtml();

        template = template.replace(/[%]inputstablist[%]/g, this.Inputs.inputListElement.GetHtml());

        template = template.replace(/[%]inputsstyle[%]/g, ``);
        template = template.replace(/[%]fuelstyle[%]/g, ` style="display: none;"`);
        template = template.replace(/[%]enginestyle[%]/g, ` style="display: none;"`);
        template = template.replace(/[%]ignitionstyle[%]/g, ` style="display: none;"`);

        return template;
    }

    RegisterVariables() {
        VariableRegister.Clear();
        LiveUpdateEvents = [];
        this.Inputs.RegisterVariables();
        this.Engine.RegisterVariables();
        this.Fuel.RegisterVariables();
        this.Ignition.RegisterVariables();
    }

    GetArrayBuffer() {
        this.RegisterVariables();
        return (new ArrayBuffer()).build({ types: types, value: [this.GetObjOperation()]});
    }

    GetObjOperation() {
        return { value: [
            { type: `UINT32`, value: 0}, //signal last operation

            //inputs
            { type: `Group`, value: [
                this.Inputs.GetObjOperation(), 
                this.Engine.GetObjOperation()
            ]},

            //preSync
            { type: `Group`, value: [ ] },

            //sync condition
            { type: `Group`, value: [ 
                { type: `Operation_StaticVariable`, value: false, result: `temp` }, //store static variable result in temp variable
                { type: `Operation_Or`, result: 0, a: `EngineSyncedId`, b: `temp` },
            ]},

            //main loop execute
            { type: `Group`, value: [ 
                this.Fuel.GetObjOperation(), 
                this.Ignition.GetObjOperation()
            ]},

            //metadata
            { toArrayBuffer() {
                var objectArray = base64ToArrayBuffer(lzjs.compressToBase64(stringifyObject(VariableRegister.GetVariableReferenceList())));
                return (new Uint32Array([objectArray.byteLength]).buffer).concatArray(objectArray);
            }}
        ]};
    }
}

class ConfigFuel extends UI.Template {
    static Template =   getFileContents(`ConfigGui/Fuel.html`);

    constructor(prop) {
        super();
        this.AFRConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            AFRConfigs,
            label:              `Air Fuel Ratio`,
            Measurement:        `Ratio`,
            ReferenceName:      `FuelParameters.Air Fuel Ratio`
        });
        this.InjectorEnableConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            InjectorEnableConfigs,
            label:              `Injector Enable`,
            Measurement:        `Bool`,
            ReferenceName:      `FuelParameters.Injector Enable`
        });
        this.InjectorPulseWidthConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            InjectorPulseWidthConfigs,
            label:              `Injector Pulse Width`,
            Measurement:        `Time`,
            ReferenceName:      `FuelParameters.Injector Pulse Width`,
            MeasurementUnitName:`ms`
        });
        this.InjectorEndPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            GenericConfigs,
            label:              `Injector End Position(BTDC)`,
            Measurement:        `Angle`,
            ReferenceName:      `FuelParameters.Injector End Position`
        });
        this.Outputs = document.createElement(`div`)
        Object.defineProperty(this.Outputs, 'saveValue', {
            get: function() { return [...this.children].map(e => e.saveValue); },
            set: function(saveValue) { 
                while(this.children.length > saveValue.length) this.removeChild(this.lastChild);
                for(let i = 0; i < saveValue.length; i++){
                    if(!this.children[i]) {
                        this.append(new ConfigTDCOutput({
                            Configs:        BooleanOutputConfigs,
                            label:          `Injector ${i+1}`,
                            Measurement:    `No Measurement`
                        }));
                    }
                    this.children[i].saveValue = saveValue[i];
                }
            }
        });
        Object.defineProperty(this.Outputs, 'value', {
            get: function() { return [...ythis.children].map(e => e.value); },
            set: function(value) { 
                while(this.children.length > value.length) this.removeChild(this.lastChild);
                for(let i = 0; i < value.length; i++){
                    if(!this.children[i]) {
                        this.append(new ConfigTDCOutput({
                            Configs:        BooleanOutputConfigs,
                            label:          `Injector ${i+1}`,
                            Measurement:    `No Measurement`
                        }));
                    }
                    this.children[i].value = value[i];
                }
            }
        });
        this.Outputs.value = new Array(8);
        this.Setup(prop);
    }

    get saveValue() {
        return super.saveValue;
    }

    set saveValue(saveValue) {
        if(saveValue?.ConfigInjectorOutputs)
            saveValue.Outputs = saveValue.ConfigInjectorOutputs.Outputs;

        super.saveValue = saveValue;
    }

    Attach() {
        super.Attach();
        UpdateOverlay();
    }

    RegisterVariables() {
        this.AFRConfigOrVariableSelection.RegisterVariables();
        VariableRegister.RegisterVariable(`FuelParameters.Cylinder Fuel Mass(Mass)`, `float`);
        this.InjectorEnableConfigOrVariableSelection.RegisterVariables();
        this.InjectorPulseWidthConfigOrVariableSelection.RegisterVariables();
        this.InjectorEndPositionConfigOrVariableSelection.RegisterVariables();
        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].RegisterVariables();
        };
    }

    GetObjOperation() {
        var group = { 
            types : [{ type: `Operation_EngineScheduleInjection`, toObj() {
                return { value: [ {
                    type: `Package`,
                    value: [ 
                        { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleInjection }, //factory id
                        { type: `FLOAT`, value: this.value.TDC.Value }, //tdc
                        this.value.GetObjOperation(),
                    ],
                    outputVariables: [ 
                        `temp`, //store in temp variable
                        `temp` //store in temp variable
                    ],
                    inputVariables: [
                        `EnginePositionId`,
                        `FuelParameters.Injector Enable`,
                        `FuelParameters.Injector Pulse Width`,
                        `FuelParameters.Injector End Position(BTDC)`
                    ]
                }]};
            }}],
            type: `Group`, 
            value: [
                this.AFRConfigOrVariableSelection.GetObjOperation(), 

                { 
                    type: `Operation_Divide`,
                    result: `FuelParameters.Cylinder Fuel Mass`,
                    a: `EngineParameters.Cylinder Air Mass`,
                    b: `FuelParameters.Air Fuel Ratio`
                },

                this.InjectorEnableConfigOrVariableSelection.GetObjOperation(), 
                this.InjectorPulseWidthConfigOrVariableSelection.GetObjOperation(), 
                this.InjectorEndPositionConfigOrVariableSelection.GetObjOperation()
            ]
        };

        for(var i = 0; i < this.Outputs.length; i++) {
            group.value.push({ type: `Operation_EngineScheduleInjection`, value: this.Outputs[i] });
        }

        return group;
    }
}
customElements.define(`config-fuel`, ConfigFuel, { extends: `div` });

class ConfigIgnition extends UI.Template {
    static Template = getFileContents(`ConfigGui/Ignition.html`);

    constructor(prop) {
        super();
        this.IgnitionEnableConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            IgnitionEnableConfigs,
            label:              `Ignition Enable`,
            Measurement:        `Bool`,
            ReferenceName:      `IgnitionParameters.Ignition Enable`
        });
        this.IgnitionAdvanceConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            IgnitionAdvanceConfigs,
            label:              `Ignition Advance`,
            Measurement:        `Angle`,
            ReferenceName:      `IgnitionParameters.Ignition Advance`
        });
        this.IgnitionDwellConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            IgnitionDwellConfigs,
            label:              `Ignition Dwell`,
            Measurement:        `Time`,
            ReferenceName:      `IgnitionParameters.Ignition Dwell`,
            MeasurementUnitName:`ms`
        });
        this.IgnitionDwellDeviationConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            IgnitionDwellConfigs,
            label:              `Ignition Dwell Deviation`,
            Measurement:        `Time`,
            ReferenceName:      `IgnitionParameters.Ignition Dwell Deviation`,
            MeasurementUnitName:`ms`
        });
        this.Outputs = document.createElement(`div`)
        Object.defineProperty(this.Outputs, 'saveValue', {
            get: function() { return [...this.children].map(e => e.saveValue); },
            set: function(saveValue) { 
                while(this.children.length > saveValue.length) this.removeChild(this.lastChild);
                for(let i = 0; i < saveValue.length; i++){
                    if(!this.children[i]) {
                        this.append(new ConfigTDCOutput({
                            Configs:        BooleanOutputConfigs,
                            label:          `Injector ${i+1}`,
                            Measurement:    `No Measurement`
                        }));
                    }
                    this.children[i].saveValue = saveValue[i];
                }
            }
        });
        Object.defineProperty(this.Outputs, 'value', {
            get: function() { return [...this.children].map(e => e.value); },
            set: function(value) { 
                while(this.children.length > value.length) this.removeChild(this.lastChild);
                for(let i = 0; i < value.length; i++){
                    if(!this.children[i]) {
                        this.append(new ConfigTDCOutput({
                            Configs:            BooleanOutputConfigs,
                            label:              `Ignition ${i+1}`,
                            Measurement:        `No Measurement`
                        }));
                    }
                    this.children[i].value = value[i];
                }
            }
        });
        this.Outputs.value = new Array(8);
        this.Setup(prop);
    }

    Attach() {
        super.Attach();
        UpdateOverlay();
    }

    RegisterVariables() {
        this.IgnitionEnableConfigOrVariableSelection.RegisterVariables();
        this.IgnitionAdvanceConfigOrVariableSelection.RegisterVariables();
        this.IgnitionDwellConfigOrVariableSelection.RegisterVariables();
        this.IgnitionDwellDeviationConfigOrVariableSelection.RegisterVariables();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].RegisterVariables();
        };
    }

    GetObjOperation() {
        var group  = { 
            types : [{ type: `Operation_EngineScheduleIgnition`, toObj() {
                return { value: [ {
                    type: `Package`,
                    value: [ 
                        { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleIgnition }, //factory id
                        { type: `FLOAT`, value: this.value.TDC.Value }, //tdc
                        this.value.GetObjOperation(),
                    ],
                    outputVariables: [ 
                        `temp`, //store in temp variable
                        `temp` //store in temp variable
                    ],
                    inputVariables: [
                        `EnginePositionId`,
                        `IgnitionParameters.Ignition Enable`,
                        `IgnitionParameters.Ignition Dwell`,
                        `IgnitionParameters.Ignition Advance`,
                        `IgnitionParameters.Ignition Dwell Deviation`
                    ]
                }]};
            }}],
            type: `Group`, 
            value: [
                this.IgnitionEnableConfigOrVariableSelection.GetObjOperation(), 
                this.IgnitionAdvanceConfigOrVariableSelection.GetObjOperation(), 
                this.IgnitionDwellConfigOrVariableSelection.GetObjOperation(), 
                this.IgnitionDwellDeviationConfigOrVariableSelection.GetObjOperation(), 
            ]
        };

        for(var i = 0; i < this.Outputs.length; i++) {
            group.value.push({ type: `Operation_EngineScheduleIgnition`, value: this.Outputs[i] });
        }

        return group;
    }
}
customElements.define(`config-ignition`, ConfigIgnition, { extends: `div` });

class ConfigEngine extends UI.Template {
    static Template = getFileContents(`ConfigGui/Engine.html`);

    constructor(prop) {
        super();
        this.CrankPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            undefined,
            label:              `Crank Position`,
            Measurement:        `Reluctor`,
            ReferenceName:      `EngineParameters.Crank Position`
        });
        this.CamPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            undefined,
            label:              `Cam Position`,
            Measurement:        `Reluctor`,
            ReferenceName:      `EngineParameters.Cam Position`
        });
        this.CylinderAirmassConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            CylinderAirmassConfigs,
            label:              `Cylinder Air Mass`,
            Measurement:        `Mass`,
            ReferenceName:      `EngineParameters.Cylinder Air Mass`
        });
        this.CylinderAirTemperatureConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            CylinderAirTemperatureConfigs,
            label:              `Cylinder Air Temperature`,
            Measurement:        `Temperature`,
            ReferenceName:      `EngineParameters.Cylinder Air Temperature`
        });
        this.ManifoldAbsolutePressureConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            ManifoldAbsolutePressureConfigs,
            label:              `Manifold Absolute Pressure`,
            Measurement:        `Pressure`,
            ReferenceName:      `EngineParameters.Manifold Absolute Pressure`
        });
        this.VolumetricEfficiencyConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            VolumetricEfficiencyConfigs,
            label:              `Volumetric Efficiency`,
            Measurement:        `Percentage`,
            ReferenceName:      `EngineParameters.Volumetric Efficiency`
        });
        this.Setup(prop);
    }

    CrankPriority = 1;//static set this for now

    RegisterVariables() {
        this.CrankPositionConfigOrVariableSelection.RegisterVariables();
        this.CamPositionConfigOrVariableSelection.RegisterVariables();

        VariableRegister.RegisterVariable(`EngineParameters.Engine Speed(AngularSpeed)`, `float`);

        var requirements = [];

        if(!this.CylinderAirmassConfigOrVariableSelection.Selection?.reference) {
            requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.GetSubConfig(), `Requirements`);
        }

        this.ManifoldAbsolutePressureConfigOrVariableSelection.hidden = (requirements?.indexOf(`Manifold Absolute Pressure`) ?? -1) < 0;
        if(!this.ManifoldAbsolutePressureConfigOrVariableSelection.hidden) 
            this.ManifoldAbsolutePressureConfigOrVariableSelection.RegisterVariables();
        
        this.CylinderAirTemperatureConfigOrVariableSelection.hidden = (requirements?.indexOf(`Cylinder Air Temperature`) ?? -1) < 0;
        if(!this.CylinderAirTemperatureConfigOrVariableSelection.hidden) 
            this.CylinderAirTemperatureConfigOrVariableSelection.RegisterVariables();
        
        this.VolumetricEfficiencyConfigOrVariableSelection.hidden = (requirements?.indexOf(`Volumetric Efficiency`) ?? -1) < 0;
        if(!this.VolumetricEfficiencyConfigOrVariableSelection.hidden) 
            this.VolumetricEfficiencyConfigOrVariableSelection.RegisterVariables();

        this.CylinderAirmassConfigOrVariableSelection.RegisterVariables();
    }

    GetObjOperation() {
        var mapRequired = false;
        var catRequired = false;
        var veRequired  = false;
        if(!this.CylinderAirmassConfigOrVariableSelection.Selection?.reference) {
            var requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.GetSubConfig(), `Requirements`);
            mapRequired = (requirements?.indexOf(`Manifold Absolute Pressure`) ?? -1) > -1;
            catRequired = (requirements?.indexOf(`Cylinder Air Temperature`) ?? -1) > -1
            veRequired  = (requirements?.indexOf(`Volumetric Efficiency`) ?? -1) > -1;
        }

        var group = { type: `Group`, value: [
            this.CrankPositionConfigOrVariableSelection.GetObjOperation(),
            this.CamPositionConfigOrVariableSelection.GetObjOperation(),

            //CalculateEnginePosition
            { 
                type: `Package`,
                value: [ 
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.Position + ( this.CrankPriority? 0 : 1) },  //factory id
                ],
                outputVariables: [ `EnginePositionId` ],
                inputVariables: [
                    `EngineParameters.Crank Position`,
                    `EngineParameters.Cam Position`
                ]
            },

            //EngineParameters
            { 
                type: `Package`,
                value: [ 
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.EngineParameters },  //factory id
                ],
                outputVariables: [ 
                    `EngineParameters.Engine Speed`,
                    `EngineSequentialId`,
                    `EngineSyncedId`
                ],
                inputVariables: [ `EnginePositionId`  ]
            }
        ]};
        
        if(mapRequired) {
            group.value.push(this.ManifoldAbsolutePressureConfigOrVariableSelection.GetObjOperation());
        }

        if(catRequired) {
            group.value.push(this.CylinderAirTemperatureConfigOrVariableSelection.GetObjOperation());
        }
        
        if(veRequired) {
            group.value.push(this.VolumetricEfficiencyConfigOrVariableSelection.GetObjOperation());
        }
        
        group.value.push(this.CylinderAirmassConfigOrVariableSelection.GetObjOperation());

        return group;
    }
}
customElements.define(`config-engine`, ConfigEngine, { extends: `div` });

class ConfigTDCOutput extends CalculationOrVariableSelection {
    constructor(prop) {
        super();
        let span = document.createElement(`span`);
        this.TDC = new UI.Number({
            Value:  0,
            step:   1,
            min:    0,
            max:    720
        });
        span.append(`\xa0\xa0\xa0\xa0\xa0\xa0TDC:`);
        span.append(this.TDC)
        span.append(`°`);
        this.Setup(prop);
        this.labelElement.parentElement.append(span);
        this.labelElement.class = `pinselectname`;
    }
}
customElements.define(`config-tdc`, ConfigTDCOutput, { extends: `div` });

class CylinderAirmass_SpeedDensity extends UI.Template {
    static Name = `Speed Density`;
    static Measurement = `Mass`;
    static Output = `float`;
    static Requirements = [`Cylinder Air Temperature`, `Manifold Absolute Pressure`, `Volumetric Efficiency`];
    static Template = `<label>Cylinder Volume:</label><div data-element="CylinderVolume"></div>`;

    constructor(prop) {
        super();
        this.CylinderVolume = new UI.NumberWithMeasurement({
            Value:              0.66594,
            step:               0.001,
            min:                0.001,
            Measurement:        `Volume`,
            MeasurementUnitName:`mL`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        return { value: [{ 
            type: `Package`,
            value: [ 
                { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.CylinderAirMass_SD },  //factory id
                { type: `FLOAT`, value: this.CylinderVolume.Value }, //Cylinder Volume
            ],
            outputVariables: [ outputVariableId ?? 0 ], //Return
            inputVariables: [ 
                `EngineParameters.Cylinder Air Temperature`,
                `EngineParameters.Manifold Absolute Pressure`,
                `EngineParameters.Volumetric Efficiency`
            ]
        }]};
    }
}
CylinderAirmassConfigs.push(CylinderAirmass_SpeedDensity);
customElements.define(`cylinderairmass-speeddensity`, CylinderAirmass_SpeedDensity, { extends: `div` });

class InjectorPulseWidth_DeadTime extends UI.Template {
    static Name = `Dead Time`;
    static Output = `float`;
    static Measurement = `Time`;
    static Template =   `<div data-element="FlowRateConfigOrVariableSelection"></div>` +
                        `<div data-element="DeadTimeConfigOrVariableSelection"></div>` +
                        `<label>Min Injector Fuel Mass:</label><div data-element="MinInjectorFuelMass"></div>`;

    constructor(prop) {
        super();
        this.FlowRateConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            GenericConfigs,
            label:              `Injector Flow Rate`,
            Measurement:        `MassFlow`,
            ReferenceName:      `FuelParameters.Injector Flow Rate`
        });
        this.DeadTimeConfigOrVariableSelection = new CalculationOrVariableSelection({
            Configs:            GenericConfigs,
            label:              `Injector Dead Time`,
            Measurement:        `Time`,
            ReferenceName:      `FuelParameters.Injector Dead Time`,
            MeasurementUnitName:`ms`
        });
        this.MinInjectorFuelMass = new UI.NumberWithMeasurement({
            Value:              0.005,
            step:               0.001,
            Measurement:        `Mass`,
            MeasurementUnitName:`g`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    RegisterVariables() {
        this.DeadTimeConfigOrVariableSelection.RegisterVariables();
        this.FlowRateConfigOrVariableSelection.RegisterVariables();
    }

    GetObjOperation(outputVariableId) {
        let group = { type: `Group`, value: [
            this.FlowRateConfigOrVariableSelection.GetObjOperation(),
            this.DeadTimeConfigOrVariableSelection.GetObjOperation(),
            
            //Store a value of 2 into the temporary variable which will be used for SquirtsPerCycle (2 squirts per cycle default)
            { type: `Operation_StaticVariable`, value: 2, result: `temp` },//static value of 2
            
            //Subtract 1 to temporary variable if Engine is running sequentially. This will be used for SquirtsPerCycle (1 squirts per cycle when sequential)
            { 
                type: `Operation_Subtract`,
                result: `temp`, //Return
                a: `temp`,
                b: `EngineSequentialId`
            },

            { 
                type: `Package`,
                value: [ 
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.InjectorDeadTime },
                    { type: `FLOAT`, value: this.MinInjectorFuelMass.Value }
                ],
                outputVariables: [ outputVariableId ?? 0 ], //Return
                inputVariables: [ 
                    `temp`,
                    `FuelParameters.Cylinder Fuel Mass`,
                    `FuelParameters.Injector Flow Rate`,
                    `FuelParameters.Injector Dead Time`
                ]
            }
        ]};

        return group;
    }
}
InjectorPulseWidthConfigs.push(InjectorPulseWidth_DeadTime);
customElements.define(`injectorpulsewidth-deadtime`, InjectorPulseWidth_DeadTime, { extends: `div` });
