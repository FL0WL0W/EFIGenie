class Increments {
    static Reset() {
        Object.entries(Increments).forEach(e => {
            var [elementname, element] = e;
            Increments[elementname] = undefined;
        });
    }
    static GenerateId() {
        Increments.VariableIncrement ??= 0;
        return ++Increments.VariableIncrement;
    }
    static RegisterVariable(Id, ListName, Name, Type, Measurement) {
        Increments[ListName] ??= [];
        Increments[ListName].push({
            Name,
            Type,
            Measurement,
            Id
        });
    }
}

var AFRConfigs = [];
AFRConfigs.push(ConfigOperation_Static);
AFRConfigs.push(ConfigOperation_LookupTable);
AFRConfigs.push(ConfigOperation_2AxisTable);
var InjectorEnableConfigs = [];
InjectorEnableConfigs.push(ConfigOperation_Static);
InjectorEnableConfigs.push(ConfigOperation_LookupTable);
InjectorEnableConfigs.push(ConfigOperation_2AxisTable);
var InjectorPulseWidthConfigs = [];
InjectorPulseWidthConfigs.push(ConfigOperation_Static);
// InjectorPulseWidthConfigs.push(ConfigOperation_LookupTable);
// InjectorPulseWidthConfigs.push(ConfigOperation_2AxisTable);
var IgnitionAdvanceConfigs = [];
IgnitionAdvanceConfigs.push(ConfigOperation_Static);
IgnitionAdvanceConfigs.push(ConfigOperation_LookupTable);
IgnitionAdvanceConfigs.push(ConfigOperation_2AxisTable);
var IgnitionEnableConfigs = [];
IgnitionEnableConfigs.push(ConfigOperation_Static);
IgnitionEnableConfigs.push(ConfigOperation_LookupTable);
IgnitionEnableConfigs.push(ConfigOperation_2AxisTable);
var IgnitionDwellConfigs = [];
IgnitionDwellConfigs.push(ConfigOperation_Static);
IgnitionDwellConfigs.push(ConfigOperation_LookupTable);
IgnitionDwellConfigs.push(ConfigOperation_2AxisTable);
var CylinderAirmassConfigs = [];
CylinderAirmassConfigs.push(ConfigOperation_Static);
var CylinderAirTemperatureConfigs = [];
CylinderAirTemperatureConfigs.push(ConfigOperation_Static);
var ManifoldAbsolutePressureConfigs = [];
ManifoldAbsolutePressureConfigs.push(ConfigOperation_Static);
var VolumetricEfficiencyConfigs = [];
VolumetricEfficiencyConfigs.push(ConfigOperation_Static);
VolumetricEfficiencyConfigs.push(ConfigOperation_LookupTable);
VolumetricEfficiencyConfigs.push(ConfigOperation_2AxisTable);

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

types = [
    { type: `INT8`, toArrayBuffer: function(val) { return new Int8Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `INT16`, toArrayBuffer: function(val) { return new Int16Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `INT32`, toArrayBuffer: function(val) { return new Int32Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `INT64`, toArrayBuffer: function(val) { return new BigInt64Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `BOOL`, toArrayBuffer: function(val) { return new Uint8Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `UINT8`, toArrayBuffer: function(val) { return new Uint8Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `UINT16`, toArrayBuffer: function(val) { return new Uint16Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `UINT32`, toArrayBuffer: function(val) { return new Uint32Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `UINT64`, toArrayBuffer: function(val) { return new BigUint64Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `FLOAT`, toArrayBuffer: function(val) { return new Float32Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `DOUBLE`, toArrayBuffer: function(val) { return new Float64Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: `VariableId`, toObj(val) {
        if(typeof val === `string` && val.indexOf(`.`) !== -1) {
            const listName = val.substring(0, val.indexOf(`.`));
            var variableName = val.substring(val.indexOf(`.`) + 1);
            if(Array.isArray(Increments[listName])) {
                var variable = Increments[listName].find(a => a.Name === variableName);
                if(variableName.indexOf(`(`) !== -1) {
                    var measurementName = variableName.substring(variableName.indexOf(`(`) + 1);
                    measurementName = measurementName.substring(0, measurementName.length - 1);
                    variableName = variableName.substring(0, variableName.indexOf(`(`));
                    var variableWithMeasurement = Increments[listName].find(a => a.Name === variableName && a.Measurement === measurementName)
                    if(variableWithMeasurement)
                        variable = variableWithMeasurement;
                }
                if(variable)
                    return { value: [{ type: `UINT32`, value: variable.Id }]};
            }
        }
        if(typeof val === `number`)
            return { value: [{ type: `UINT32`, value: val }]};
        return { value: [{ type: `UINT32`, value: 0 }]};
    }},
    { type: `Operation_StaticVariable`, toObj(val) {
        obj = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Static}
        ]};

        var type = GetType(val);
        var typeID = GetTypeId(type);
        
        obj.value.push(
            { type: `UINT8`, value: typeID }, //typeid
            { type: type, value: val } //val
        );

        return obj;
    }},
    { type: `Operation_Add`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Add },
        ]};
    }},
    { type: `Operation_Subtract`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Subtract },
        ]};
    }},
    { type: `Operation_Multiply`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Multiply },
        ]};
    }},
    { type: `Operation_Divide`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Divide },
        ]};
    }},
    { type: `Operation_And`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.And },
        ]};
    }},
    { type: `Operation_Or`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Or },
        ]};
    }},
    { type: `Operation_GreaterThan`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.GreaterThan },
        ]};
    }},
    { type: `Operation_LessThan`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LessThan },
        ]};
    }},
    { type: `Operation_Equal`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Equal },
        ]};
    }},
    { type: `Operation_GreaterThanOrEqual`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.GreaterThanOrEqual },
        ]};
    }},
    { type: `Operation_LessThanOrEqual`, toObj(val) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LessThanOrEqual },
        ]};
    }}
]

for(var index in STM32TypeAlignment) {
    var type = types.find(x => x.type == x86TypeAlignment[index].type);
    if(type){
        type.align = x86TypeAlignment[index].align
    }
}

class ConfigTop extends UITemplate {
    static Template = getFileContents(`ConfigGui/Top.html`);

    constructor(prop){
        prop ??= {};
        prop.Inputs = new ConfigInputs();
        prop.Engine = new ConfigEngine();
        prop.Fuel = new ConfigFuel();
        prop.Ignition = new ConfigIgnition();
        super(prop);
    }

    Detach() {
        super.Detach();
        DetachPasteOptions();
        Increments.Reset();//this is top level object so reset increments. this is not elegant

        $(document).off(`click.${this.GUID}`);
    }

    Attach() {
        super.Attach();
        AttachPasteOptions();
        this.SetIncrements();//this is top level object so set increments. this is not elegant

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

        template = template.replace(/[%]inputstablist[%]/g, this.Inputs.GetInputsHtml());
        template = template.replace(/[%]inputstabcontrols[%]/g, this.Inputs.GetControlsHtml());

        template = template.replace(/[%]inputsstyle[%]/g, ``);
        template = template.replace(/[%]fuelstyle[%]/g, ` style="display: none;"`);
        template = template.replace(/[%]enginestyle[%]/g, ` style="display: none;"`);
        template = template.replace(/[%]ignitionstyle[%]/g, ` style="display: none;"`);

        return template;
    }

    SetIncrements() {
        this.Inputs.SetIncrements();
        this.Engine.SetIncrements();
        this.Fuel.SetIncrements();
        this.Ignition.SetIncrements();
    }

    GetArrayBufferPackage() {
        return (new ArrayBuffer()).build({ types: types, value: [{obj: this.GetObjOperation()}]});
    }

    GetObjOperation() {
        return { value: [
            { type: `UINT32`, value: 0}, //signal last operation

            //inputs
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }, // Group
            { type: `UINT16`, value: 2 }, // number of operations
            { obj: this.Inputs.GetObjOperation()}, 
            { obj: this.Engine.GetObjOperation()}, 

            //preSync
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }, // Group
            { type: `UINT16`, value: 0 }, // number of operations

            //sync condition
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }, // Group
            { type: `UINT16`, value: 2 }, // number of operations
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, // Package
            { type: `Operation_StaticVariable`, value: false}, //bool
            { type: `VariableId`, value: -1 }, //store in static value variable

            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, // Package
            { type: `Operation_Or`}, //OR
            { type: `VariableId`, value: 0 }, //return this result
            { type: `VariableId`, value: Increments.EngineSyncedId }, //bool
            { type: `VariableId`, value: -1 }, //use static value variable

            //main loop execute
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }, // Group
            { type: `UINT16`, value: 2 }, // number of operations
            { obj: this.Fuel.GetObjOperation()}, 
            { obj: this.Ignition.GetObjOperation()}, 
        ]};
    }
}

class ConfigFuel extends UITemplate {
    static Template =   getFileContents(`ConfigGui/Fuel.html`);

    constructor(prop) {
        prop ??= {};
        prop.AFRConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            AFRConfigs,
            Label:              `Air Fuel Ratio`,
            Measurement:        `Ratio`,
            VariableListName:   `FuelParameters`
        });
        prop.InjectorEnableConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            InjectorEnableConfigs,
            Label:              `Injector Enable`,
            Measurement:        `Bool`,
            VariableListName:   `FuelParameters`
        });
        prop.InjectorPulseWidthConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            InjectorPulseWidthConfigs,
            Label:              `Injector Pulse Width`,
            Measurement:        `Time`,
            VariableListName:   `FuelParameters`,
            MeasurementIndex: 1
        });
        prop.InjectorEndPositionConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            GenericConfigs,
            Label:              `Injector End Position(BTDC)`,
            Measurement:        `Angle`,
            VariableListName:   `FuelParameters`
        });
        prop.Outputs = [];
        for(var i = 0; i < 8; i++){
            prop.Outputs[i] = new ConfigTDCOutput({
                Configs:        BooleanOutputConfigs,
                Label:          `Injector ${i+1}`,
                Measurement:    `No Measurement`
            });
        }
        super(prop);
    }

    GetValue() {
        var value = super.GetValue();
        value.Outputs = [];
        for(var i = 0; i < this.Outputs.length; i++){
            value.Outputs[i] = this.Outputs[i].GetValue();
        };
        return value;
    }

    SetValue(value) {
        if(value?.ConfigInjectorOutputs)
            value.Outputs = value.ConfigInjectorOutputs.Outputs;
        if(value?.Outputs)
        {
            this.Outputs = [];
            for(var i = 0; i < value.Outputs.length; i++){
                if(!this.Outputs[i])
                    this.Outputs[i] = new ConfigTDCOutput({
                        Configs:        BooleanOutputConfigs,
                        Label:          `Injector ${i+1}`,
                        Measurement:    `No Measurement`
                    });
                this.Outputs[i].SetValue(value.Outputs[i])
            }
        }

        super.SetValue(value);
    }

    CylinderFuelMassId = -1;
    SetIncrements() {
        this.AFRConfigOrVariableSelection.SetIncrements();

        Increments.VariableIncrement ??= 0;
        this.CylinderFuelMassId = ++Increments.VariableIncrement;

        Increments.FuelParameters ??= [];
        Increments.FuelParameters.push({ 
            Name:           `Cylinder Fuel Mass`, 
            Id:             this.CylinderFuelMassId,
            Type:           `float`,
            Measurement:    `Mass`
        });

        this.InjectorEnableConfigOrVariableSelection.SetIncrements();
        this.InjectorPulseWidthConfigOrVariableSelection.SetIncrements();
        this.InjectorEndPositionConfigOrVariableSelection.SetIncrements();
        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].SetIncrements();
        };
    }

    GetObjOperation() {
        if(this.CylinderFuelMassId === -1)
            throw `Set Increments First`;

        var numberOfOperations = 1 + this.Outputs.length;
        if(!this.AFRConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.InjectorEnableConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.InjectorPulseWidthConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.InjectorEndPositionConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;

        var obj = { 
        types : [
            { type: `Operation_EngineScheduleInjection`, toObj(val) {
                return { value: [
                    { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, // Package
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleInjection }, //factory id
                    { type: `FLOAT`, value: val.TDC.Value }, //tdc
                    { obj: val.GetObjOperation()}, 
                    { type: `VariableId`, value: -1 }, //store returns at -1
                    { type: `VariableId`, value: -1 }, //store returns at -1
                    { type: `VariableId`, value: Increments.EnginePositionId },
                    { type: `VariableId`, value: `FuelParameters.Injector Enable` },
                    { type: `VariableId`, value: `FuelParameters.Injector Pulse Width` },
                    { type: `VariableId`, value: `FuelParameters.Injector End Position(BTDC)` },
                ]};
            }}],
        value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }, // Group
            { type: `UINT16`, value: numberOfOperations }, // number of operations

            { obj: this.AFRConfigOrVariableSelection.GetObjOperation()}, 

            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, // Package
            { type: `Operation_Divide`}, //Divide
            { type: `VariableId`, value: this.CylinderFuelMassId }, //Cylinder Fuel Mass ID
            { type: `VariableId`, value: `EngineParameters.Cylinder Air Mass` },
            { type: `VariableId`, value: this.AFRConfigOrVariableSelection.GetVariableId()}, 

            { obj: this.InjectorEnableConfigOrVariableSelection.GetObjOperation()}, 
            { obj: this.InjectorPulseWidthConfigOrVariableSelection.GetObjOperation()}, 
            { obj: this.InjectorEndPositionConfigOrVariableSelection.GetObjOperation()}
        ]};

        for(var i = 0; i < this.Outputs.length; i++) {
            obj.value.push({ type: `Operation_EngineScheduleInjection`, value: this.Outputs[i] });
        }

        return obj;
    }
}

class ConfigIgnition extends UITemplate {
    static Template = getFileContents(`ConfigGui/Ignition.html`);

    constructor(prop) {
        prop ??= {};
        prop.IgnitionEnableConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            IgnitionEnableConfigs,
            Label:              `Ignition Enable`,
            Measurement:        `Bool`,
            VariableListName:   `IgnitionParameters`
        });
        prop.IgnitionAdvanceConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            IgnitionAdvanceConfigs,
            Label:              `Ignition Advance`,
            Measurement:        `Angle`,
            VariableListName:   `IgnitionParameters`
        });
        prop.IgnitionDwellConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            IgnitionDwellConfigs,
            Label:              `Ignition Dwell`,
            Measurement:        `Time`,
            VariableListName:   `IgnitionParameters`,
            MeasurementIndex: 1
        });
        prop.IgnitionDwellDeviationConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            IgnitionDwellConfigs,
            Label:              `Ignition Dwell Deviation`,
            Measurement:        `Time`,
            VariableListName:   `IgnitionParameters`,
            MeasurementIndex: 1
        });
        prop.Outputs = [];
        for(var i = 0; i < 8; i++){
            prop.Outputs[i] = new ConfigTDCOutput({
                Configs:            BooleanOutputConfigs,
                Label:              `Ignition ${i+1}`,
                Measurement:        `No Measurement`
            });
        }
        super(prop);
    }

    GetValue() {
        var value = super.GetValue();
        value.Outputs = [];
        for(var i = 0; i < this.Outputs.length; i++){
            value.Outputs[i] = this.Outputs[i].GetValue();
        };
        return value;
    }

    SetValue(value) {
        if(value?.Outputs)
        {
            this.Outputs = [];
            for(var i = 0; i < value.Outputs.length; i++){
                if(!this.Outputs[i])
                    this.Outputs[i] = new ConfigTDCOutput({
                        Configs:            BooleanOutputConfigs,
                        Label:              `Ignition ${i+1}`,
                        Measurement:        `No Measurement`
                    });
                this.Outputs[i].SetValue(value.Outputs[i])
            }
        }

        super.SetValue(value);
    }

    SetIncrements() {
        this.IgnitionEnableConfigOrVariableSelection.SetIncrements();
        this.IgnitionAdvanceConfigOrVariableSelection.SetIncrements();
        this.IgnitionDwellConfigOrVariableSelection.SetIncrements();
        this.IgnitionDwellDeviationConfigOrVariableSelection.SetIncrements();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].SetIncrements();
        };
    }

    GetObjOperation() {
        var numberOfOperations = this.Outputs.length;
        if(!this.IgnitionEnableConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.IgnitionAdvanceConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.IgnitionDwellConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.IgnitionDwellDeviationConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;

        var obj  = { 
        types : [
            { type: `Operation_EngineScheduleIgnition`, toObj(val) {
                return { value: [
                    { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, // Package
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleIgnition }, //factory id
                    { type: `FLOAT`, value: val.TDC.Value }, //tdc
                    { obj: val.GetObjOperation()}, 
                    { type: `VariableId`, value: -1 }, //store returns at -1
                    { type: `VariableId`, value: -1 }, //store returns at -1
                    { type: `VariableId`, value: Increments.EnginePositionId },
                    { type: `VariableId`, value: `IgnitionParameters.Ignition Enable` },
                    { type: `VariableId`, value: `IgnitionParameters.Ignition Dwell` },
                    { type: `VariableId`, value: `IgnitionParameters.Ignition Advance` },
                    { type: `VariableId`, value: `IgnitionParameters.Ignition Dwell Deviation` },
                ]};
            }}],
        value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }, // Group
            { type: `UINT16`, value: numberOfOperations }, // number of operations

            { obj: this.IgnitionEnableConfigOrVariableSelection.GetObjOperation()}, 
            { obj: this.IgnitionAdvanceConfigOrVariableSelection.GetObjOperation()}, 
            { obj: this.IgnitionDwellConfigOrVariableSelection.GetObjOperation()}, 
            { obj: this.IgnitionDwellDeviationConfigOrVariableSelection.GetObjOperation()}, 
        ]};

        for(var i = 0; i < this.Outputs.length; i++) {
            obj.value.push({ type: `Operation_EngineScheduleIgnition`, value: this.Outputs[i] });
        }

        return obj;
    }
}

class ConfigEngine extends UITemplate {
    static Template = getFileContents(`ConfigGui/Engine.html`);

    constructor(prop) {
        prop ??= {};
        prop.CrankPositionConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            undefined,
            Label:              `Crank Position`,
            Measurement:        `ReluctorResult`,
            VariableListName:   `EngineParameters`
        });
        prop.CamPositionConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            undefined,
            Label:              `Cam Position`,
            Measurement:        `ReluctorResult`,
            VariableListName:   `EngineParameters`
        });
        prop.CylinderAirmassConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            CylinderAirmassConfigs,
            Label:              `Cylinder Air Mass`,
            Measurement:        `Mass`,
            VariableListName:   `EngineParameters`
        });
        prop.CylinderAirTemperatureConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            CylinderAirTemperatureConfigs,
            Label:              `Cylinder Air Temperature`,
            Measurement:        `Temperature`,
            VariableListName:   `EngineParameters`
        });
        prop.ManifoldAbsolutePressureConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            ManifoldAbsolutePressureConfigs,
            Label:              `Manifold Absolute Pressure`,
            Measurement:        `Pressure`,
            VariableListName:   `EngineParameters`
        });
        prop.VolumetricEfficiencyConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            VolumetricEfficiencyConfigs,
            Label:              `Volumetric Efficiency`,
            Measurement:        `Percentage`,
            VariableListName:   `EngineParameters`
        });
        super(prop);
    }

    CrankPriority = 1;//static set this for now

    EnginePositionId = -1;
    EngineRPMId = -1;
    SetIncrements() {
        this.CrankPositionConfigOrVariableSelection.SetIncrements();
        this.CamPositionConfigOrVariableSelection.SetIncrements();

        Increments.VariableIncrement ??= 0;
        Increments.EnginePositionId = this.EnginePositionId = ++Increments.VariableIncrement;
        Increments.EngineSequentialId = this.EngineSequentialId = ++Increments.VariableIncrement;
        Increments.EngineSyncedId = this.EngineSyncedId = ++Increments.VariableIncrement;
        this.EngineRPMId = ++Increments.VariableIncrement;

        Increments.EngineParameters ??= [];
        Increments.EngineParameters.push({ 
            Name:           `Engine Speed`, 
            Id:             this.EngineRPMId,
            Type:           `float`,
            Measurement:    `AngularSpeed`
        });

        var requirements = [];

        if(!this.CylinderAirmassConfigOrVariableSelection.Selection?.reference) {
            requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.GetSubConfig(), `Requirements`);
        }

        if(requirements?.indexOf(`Manifold Absolute Pressure`) > -1) {
            this.ManifoldAbsolutePressureConfigOrVariableSelection.Show();
            this.ManifoldAbsolutePressureConfigOrVariableSelection.SetIncrements();
        } else {
            this.ManifoldAbsolutePressureConfigOrVariableSelection.Hide();
        }
        
        if(requirements?.indexOf(`Cylinder Air Temperature`) > -1) {
            this.CylinderAirTemperatureConfigOrVariableSelection.Show();
            this.CylinderAirTemperatureConfigOrVariableSelection.SetIncrements();
        } else {
            this.CylinderAirTemperatureConfigOrVariableSelection.Hide();
        }

        if(requirements?.indexOf(`Volumetric Efficiency`) > -1) {
            this.VolumetricEfficiencyConfigOrVariableSelection.Show();
            this.VolumetricEfficiencyConfigOrVariableSelection.SetIncrements();
        } else {
            this.VolumetricEfficiencyConfigOrVariableSelection.Hide();
        }
        
        this.CylinderAirmassConfigOrVariableSelection.SetIncrements();
    }

    GetObjOperation() {
        if(this.EnginePositionId === -1 || this.EngineSequentialId === -1 || this.EngineSyncedId === -1 || this.EngineRPMId === -1)
            throw `Set Increments First`;

        var mapRequired = false;
        var catRequired = false;
        var veRequired  = false;
        if(!this.CylinderAirmassConfigOrVariableSelection.Selection?.reference) {
            var requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.GetSubConfig(), `Requirements`);
            mapRequired = requirements && requirements.indexOf(`Manifold Absolute Pressure`) > -1;
            catRequired = requirements && requirements.indexOf(`Cylinder Air Temperature`) > -1
            veRequired = requirements && requirements.indexOf(`Volumetric Efficiency`) > -1;
        }

        var numberOfOperations = 2;
        if(!this.CrankPositionConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.CamPositionConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(mapRequired && !this.ManifoldAbsolutePressureConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(catRequired && !this.CylinderAirTemperatureConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(veRequired && !this.VolumetricEfficiencyConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.CylinderAirmassConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;



        var obj = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }, // Group
            { type: `UINT16`, value: numberOfOperations }, // number of operations

            { obj: this.CrankPositionConfigOrVariableSelection.GetObjOperation() },

            { obj: this.CamPositionConfigOrVariableSelection.GetObjOperation() },

            //CalculateEnginePosition
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, //Package
            { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.Position + ( this.CrankPriority? 0 : 1) },  //factory id
            { type: `VariableId`, value: this.EnginePositionId },  //EnginePositionId
            { type: `VariableId`, value: this.CrankPositionConfigOrVariableSelection.GetVariableId() },  //CrankPositionId
            { type: `VariableId`, value: this.CamPositionConfigOrVariableSelection.GetVariableId() },  //CamPositionId

            //EngineParameters
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, //Package
            { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.EngineParameters },  //factory id
            { type: `VariableId`, value: this.EngineRPMId },  //EngineRPMId
            { type: `VariableId`, value: this.EngineSequentialId },  //EngineSequentialId
            { type: `VariableId`, value: this.EngineSyncedId },  //EngineSyncedId
            { type: `VariableId`, value: this.EnginePositionId }, //EnginePositionId
        ]};

        
        if(mapRequired) {
            obj.value.push({ obj: this.ManifoldAbsolutePressureConfigOrVariableSelection.GetObjOperation() });
        }

        if(catRequired) {
            obj.value.push({ obj: this.CylinderAirTemperatureConfigOrVariableSelection.GetObjOperation() });
        }
        
        if(veRequired) {
            obj.value.push({ obj: this.VolumetricEfficiencyConfigOrVariableSelection.GetObjOperation() });
        }
        
        obj.value.push({ obj: this.CylinderAirmassConfigOrVariableSelection.GetObjOperation() });

        return obj;
    }
}

class ConfigOperationCylinderAirmass_SpeedDensity extends UITemplate {
    static Name = `Speed Density`;
    static Measurement = `Mass`;
    static Output = `float`;
    static Requirements = [`Cylinder Air Temperature`, `Manifold Absolute Pressure`, `Volumetric Efficiency`];
    static Template = `<div><label for="$CylinderVolume.GUID$">Cylinder Volume:</label>$CylinderVolume$</div>`;

    constructor(prop) {
        prop ??= {};
        prop.CylinderVolume = new UINumberWithMeasurement({
            Value:          0.66594,
            Step:           0.001,
            Min:            0.001,
            Measurement:    `Volume`,
            MeasurementIndex: 1
        });
        super(prop);
    }

    GetObjOperation(outputVariableId) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, //Package
            { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.CylinderAirMass_SD }, //factory ID
            { type: `FLOAT`, value: this.CylinderVolume.Value }, //Cylinder Volume
            { type: `VariableId`, value: outputVariableId ?? 0 },
            { type: `VariableId`, value: `EngineParameters.Cylinder Air Temperature` },
            { type: `VariableId`, value: `EngineParameters.Manifold Absolute Pressure` },
            { type: `VariableId`, value: `EngineParameters.Volumetric Efficiency` },
        ]};
    }
}
CylinderAirmassConfigs.push(ConfigOperationCylinderAirmass_SpeedDensity);

class ConfigInjectorPulseWidth_DeadTime extends UITemplate {
    static Name = `Dead Time`;
    static Output = `float`;
    static Measurement = `Time`;
    static Template =   `<div>$FlowRateConfigOrVariableSelection$</div>` +
                        `<div>$DeadTimeConfigOrVariableSelection$</div>` +
                        `<div><label for="$MinInjectorFuelMass.GUID$">Min Injector Fuel Mass:</label>$MinInjectorFuelMass$</div>`;

    constructor(prop) {
        prop ??= {};
        prop.FlowRateConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            GenericConfigs,
            Label:              `Injector Flow Rate`,
            Measurement:        `MassFlow`,
            VariableListName:   `FuelParameters`
        });
        prop.DeadTimeConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            GenericConfigs,
            Label:              `Injector Dead Time`,
            Measurement:        `Time`,
            VariableListName:   `FuelParameters`,
            MeasurementIndex: 1
        });
        prop.MinInjectorFuelMass = new UINumberWithMeasurement({
            Value:          0.005,
            Step:           0.001,
            Measurement:    `Mass`,
            MeasurementIndex: 1
        });
        super(prop);
    }

    SetIncrements() {
        this.DeadTimeConfigOrVariableSelection.SetIncrements();
        this.FlowRateConfigOrVariableSelection.SetIncrements();
    }

    GetObjOperation(outputVariableId) {
        var numberOfOperations = 3;
        if(!this.FlowRateConfigOrVariableSelection.IsVariable())
            numberOfOperations++;
        if(!this.DeadTimeConfigOrVariableSelection.IsVariable())
            numberOfOperations++;

        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }, // Group
            { type: `UINT16`, value: numberOfOperations }, // number of operations

            { obj: this.FlowRateConfigOrVariableSelection.GetObjOperation()},
            { obj: this.DeadTimeConfigOrVariableSelection.GetObjOperation()},
            
            //Store a value of 2 into the temporary variable (-1) which will be used for SquirtsPerCycle (2 squirts per cycle default)
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, //Package
            { type: `Operation_StaticVariable`, value: 2 }, //static value of 2
            { type: `VariableId`, value: -1 }, //store in variable id -1
            
            //Subtract 1 to temporary variable (-1) if Engine is running sequentially. This will be used for SquirtsPerCycle (1 squirts per cycle when sequential)
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, //Package
            { type: `Operation_Subtract` }, //Subtract
            { type: `VariableId`, value: -1 }, //store in variable id -1
            { type: `VariableId`, value: -1 }, //first parameter variable id -1
            { type: `VariableId`, value: Increments.EngineSequentialId }, //second parameter EngineSequentialId

            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Package }, //Package
            { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.InjectorDeadTime },
            { type: `FLOAT`, value: this.MinInjectorFuelMass.Value },
            { type: `VariableId`, value: outputVariableId ?? 0 },
            { type: `VariableId`, value: -1 }, //first parameter variable id -1
            { type: `VariableId`, value: `FuelParameters.Cylinder Fuel Mass` },
            { type: `VariableId`, value: this.FlowRateConfigOrVariableSelection.GetVariableId() },
            { type: `VariableId`, value: this.DeadTimeConfigOrVariableSelection.GetVariableId() },
        ]};
    }
}
InjectorPulseWidthConfigs.push(ConfigInjectorPulseWidth_DeadTime);

class ConfigTDCOutput extends ConfigOrVariableSelection {
    static Template = `<div><label for="$TDC.GUID$"><div style="display: inline-block;">$Label$</div>:&nbsp;&nbsp;&nbsp;TDC:$TDC$° &nbsp;&nbsp;&nbsp;Output:</label>$Selection$ $ConfigValue$</div>`;

    constructor(prop) {
        prop ??= {};
        prop.TDC = new UINumber({
            Value: 0,
            Step: 1,
            Min: 0,
            Max: 720
        })
        super(prop);
    }
}