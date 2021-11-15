var Increments = {};
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
        return "VOID";
    if(typeof value === "boolean")
        return "BOOL"
    if(value % 1 !== 0)
        return "FLOAT";

    if(value < 0) {
        if(value < 128 && value > -129)
            return "INT8";
        if(value < 32768 && value > -32759)
            return "INT16";
        if(value < 2147483648 && value > -2147483649)
            return "INT32";
        if(value < 9223372036854775807 && value > -9223372036854775808)
            return "INT64";

        throw "number too big";
    }

    if(value < 128)
        return "INT8";
    if(value < 256)
        return "UINT8";
    if(value < 32768)
        return "INT16";
    if(value < 65536)
        return "UINT16";
    if(value < 2147483648)
        return "INT32";
    if(value < 4294967295)
        return "UINT32";
    if(value < 9223372036854775807)
        return "INT64";
    if(value < 18446744073709551615)
        return "UINT64";
    throw "number too big";
}

function GetTypeId(type) {
    switch(type) {
        case "VOID": return 0;
        case "UINT8": return 1;
        case "UINT16": return 2;
        case "UINT32": return 3;
        case "UINT64": return 4;
        case "INT8": return 5;
        case "INT16": return 6;
        case "INT32": return 7;
        case "INT64": return 8;
        case "FLOAT": return 9;
        case "DOUBLE": return 10;
        case "BOOL": return 11;
    }
}


PackedTypeAlignment = [
    { type: "INT8", align: 1 }, 
    { type: "INT16", align: 1 },
    { type: "INT32", align: 1 },
    { type: "INT64", align: 1 },
    { type: "BOOL", align: 1 }, 
    { type: "UINT8", align: 1 },
    { type: "UINT16", align: 1 },
    { type: "UINT32", align: 1 },
    { type: "UINT64", align: 1 },
    { type: "FLOAT", align: 1 },
    { type: "DOUBLE", align: 1 },
]

STM32TypeAlignment = [
    { type: "INT8", align: 1 }, 
    { type: "INT16", align: 2 },
    { type: "INT32", align: 4 },
    { type: "INT64", align: 8 },
    { type: "BOOL", align: 1 }, 
    { type: "UINT8", align: 1 },
    { type: "UINT16", align: 2 },
    { type: "UINT32", align: 4 },
    { type: "UINT64", align: 8 },
    { type: "FLOAT", align: 4 },
    { type: "DOUBLE", align: 8 },
]

x86TypeAlignment = [
    { type: "INT8", align: 1 }, 
    { type: "INT16", align: 2 },
    { type: "INT32", align: 4 },
    { type: "INT64", align: 8 },
    { type: "BOOL", align: 1 }, 
    { type: "UINT8", align: 1 },
    { type: "UINT16", align: 2 },
    { type: "UINT32", align: 4 },
    { type: "UINT64", align: 8 },
    { type: "FLOAT", align: 4 },
    { type: "DOUBLE", align: 8 },
]

types = [
    { type: "INT8", toArrayBuffer: function(val) { return new Int8Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "INT16", toArrayBuffer: function(val) { return new Int16Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "INT32", toArrayBuffer: function(val) { return new Int32Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "INT64", toArrayBuffer: function(val) { return new BigInt64Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "BOOL", toArrayBuffer: function(val) { return new Uint8Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "UINT8", toArrayBuffer: function(val) { return new Uint8Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "UINT16", toArrayBuffer: function(val) { return new Uint16Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "UINT32", toArrayBuffer: function(val) { return new Uint32Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "UINT64", toArrayBuffer: function(val) { return new BigUint64Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "FLOAT", toArrayBuffer: function(val) { return new Float32Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "DOUBLE", toArrayBuffer: function(val) { return new Float64Array(Array.isArray(val)? val : [val]).buffer; }},
    { type: "PackageOptions", toObj(val) {
        if(val.Group !== undefined)
            return { value: [
                { type: "UINT8", value: 0x08}, //group
                { type: "UINT16", value: val.Group}, //number of operations
            ]};
        
        return { value: [{ type: "UINT8", value: (val.DoNotPackage? 0x10 : 0x00) | (val.Return? 0x04 : 0x00) | (val.Store? 0x02 : 0x00) | (val.Immediate? 0x01 : 0x00)}]};
    }},
    { type: "Operation_StaticVariable", toObj(val) {
        obj = { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Static} //number of operations
        ]};

        var type = GetType(val);
        var typeID = GetTypeId(type);
        
        obj.value.push({ type: "UINT8", value: typeID }); //typeid
        obj.value.push({ type: type, value: val }); //type

        return obj;
    }},
    { type: "Operation_Add", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Add },
        ]};
    }},
    { type: "Operation_Subtract", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Subtract },
        ]};
    }},
    { type: "Operation_Multiply", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Multiply },
        ]};
    }},
    { type: "Operation_Divide", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Divide },
        ]};
    }},
    { type: "Operation_And", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.And },
        ]};
    }},
    { type: "Operation_Or", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Or },
        ]};
    }},
    { type: "Operation_GreaterThan", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.GreaterThan },
        ]};
    }},
    { type: "Operation_LessThan", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LessThan },
        ]};
    }},
    { type: "Operation_Equal", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Equal },
        ]};
    }},
    { type: "Operation_GreaterThanOrEqual", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.GreaterThanOrEqual },
        ]};
    }},
    { type: "Operation_LessThanOrEqual", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LessThanOrEqual },
        ]};
    }},
    { type: "VariableParameter", toObj(val) {
        return { value: [
            { type: "UINT8", value: 0 }, //use variable
            { type: "UINT32", value: val },//variable ID
        ]};
    }},
    { type: "OperationParameter", toObj(val) {
        return { value: [
            { type: "UINT8", value: val }, //operation index
            { type: "UINT8", value: 0 }, //use first return
        ]};
    }},
]

for(var index in x86TypeAlignment) {
    var type = types.find(x => x.type == x86TypeAlignment[index].type);
    if(type){
        type.align = x86TypeAlignment[index].align
    }
}

function ResetIncrements()
{
    Increments = {};
}

class ConfigTop {
    static Template = getFileContents("ConfigGui/Top.html");

    constructor(){
        this.GUID = getGUID();
    }

    Inputs = new ConfigInputs();
    Engine = new ConfigEngine();
    Fuel = new ConfigFuel();
    Ignition = new ConfigIgnition();
    
    GetValue() {
        return { 
            Inputs: this.Inputs.GetValue(),
            Engine: this.Engine.GetValue(),
            Fuel: this.Fuel.GetValue(),
            Ignition: this.Ignition.GetValue()
        };
    }

    SetValue(obj) {
        this.Detach();
        this.Inputs = new ConfigInputs();
        this.Engine = new ConfigEngine();
        this.Fuel = new ConfigFuel();
        this.Ignition = new ConfigIgnition();

        this.Inputs.SetValue(!obj? undefined : obj.Inputs);
        this.Engine.SetValue(!obj? undefined : obj.Engine);
        this.Fuel.SetValue(!obj? undefined : obj.Fuel);
        this.Ignition.SetValue(!obj? undefined : obj.Ignition);

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        ResetIncrements();//this is top level object so reset increments. this is not elegant
        DetachPasteOptions();
        this.Inputs.Detach();
        this.Engine.Detach();
        this.Fuel.Detach();
        this.Ignition.Detach();

        $(document).off("click."+this.GUID);
    }

    Attach() {
        this.Detach();
        AttachPasteOptions();
        var thisClass = this;
        this.SetIncrements();//this is top level object so set increments. this is not elegant
        if(Increments.PostEvent){
            Increments.PostEvent.forEach(element => {
                element();
            });
        }
        this.Inputs.Attach();
        this.Engine.Attach();
        this.Fuel.Attach();
        this.Ignition.Attach();

        $(document).on("click." + this.GUID, "#" + this.GUID + "-sidebar-open", function(){
            var sidebarSelector = $("#" + thisClass.GUID + "-sidebar");
            var containerSelector = $("#" + thisClass.GUID + "-container");
            var width = sidebarSelector.width();
            var moveamount = 0.005 * width / 0.1;
            var left = containerSelector.position().left;
            sidebarSelector.show();
            sidebarSelector.css("left", (left-width) + "px");
            var intervalId = setInterval(function() {
                if (left >= width) {
                    clearInterval(intervalId);
                } else {
                    left += moveamount;
                    containerSelector.css("left", left + "px");
                    containerSelector.css("margin-right", left + "px");
                    sidebarSelector.css("left", (left-width) + "px");
                    sidebarSelector.css('opacity', left / width);
                }
            }, 5);
            $("#" + thisClass.GUID + "-sidebar-open").hide();
        });

        $(document).on("click." + this.GUID, "#" + this.GUID + "-sidebar-close", function(){
            var sidebarSelector = $("#" + thisClass.GUID + "-sidebar");
            var containerSelector = $("#" + thisClass.GUID + "-container");
            var width = sidebarSelector.width();
            var moveamount = 0.005 * width / 0.1;
            var left = containerSelector.position().left;
            sidebarSelector.css("left", (left-width) + "px");
            var intervalId = setInterval(function() {
                if (left <= 0) {
                    clearInterval(intervalId);
                    sidebarSelector.hide();
                } else {
                    left -= moveamount;
                    containerSelector.css("left", left + "px");
                    containerSelector.css("margin-right", left + "px");
                    sidebarSelector.css("left", (left-width) + "px");
                    sidebarSelector.css('opacity', left / width);
                }
            }, 5);
            $("#" + thisClass.GUID + "-sidebar-open").show();
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-inputstab, #" + this.GUID + "-inputstablist", function(e){
            if($(e.target).hasClass("expand")) {
                if( $("#" + thisClass.GUID + "-inputstablist").is(":visible")) {
                    $(e.target).html("►&nbsp;");
                    $("#" + thisClass.GUID + "-inputstablist").hide();
                } else {
                    $(e.target).html("▼&nbsp;");
                    $("#" + thisClass.GUID + "-inputstablist").show();
                }
            } else {
                $("." + thisClass.GUID + "-content").hide();
                $("#" + thisClass.GUID + "-inputs").show();
                $("#" + thisClass.GUID + "-inputstab .w3-right").show();
                $("#" + thisClass.GUID + "-sidebar .w3-bar-item").removeClass("active");
                $("#" + thisClass.GUID + "-inputstab").addClass("active");
                $("#" + thisClass.GUID + "-title").html("Inputs");
            }
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-enginetab", function(){
            $("." + thisClass.GUID + "-content").hide();
            $("#" + thisClass.GUID + "-engine").show();
            $("#" + thisClass.GUID + "-inputstab .w3-right").hide();
            $("#" + thisClass.GUID + "-sidebar .w3-bar-item").removeClass("active");
            $("#" + thisClass.GUID + "-enginetab").addClass("active");
            $("#" + thisClass.GUID + "-title").html("Engine");
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-fueltab", function(){
            $("." + thisClass.GUID + "-content").hide();
            $("#" + thisClass.GUID + "-fuel").show();
            $("#" + thisClass.GUID + "-inputstab .w3-right").hide();
            $("#" + thisClass.GUID + "-sidebar .w3-bar-item").removeClass("active");
            $("#" + thisClass.GUID + "-fueltab").addClass("active");
            $("#" + thisClass.GUID + "-title").html("Fuel");
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-ignitiontab", function(){
            $("." + thisClass.GUID + "-content").hide();
            $("#" + thisClass.GUID + "-ignition").show();
            $("#" + thisClass.GUID + "-inputstab .w3-right").hide();
            $("#" + thisClass.GUID + "-sidebar .w3-bar-item").removeClass("active");
            $("#" + thisClass.GUID + "-ignitiontab").addClass("active");
            $("#" + thisClass.GUID + "-title").html("Ignition");
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);

        template = template.replace(/[$]inputs[$]/g, this.Inputs.GetHtml());
        template = template.replace(/[$]inputstablist[$]/g, this.Inputs.GetInputsHtml());
        template = template.replace(/[$]inputstabcontrols[$]/g, this.Inputs.GetControlsHtml());
        template = template.replace(/[$]inputsstyle[$]/g, "");
        
        template = template.replace(/[$]fuel[$]/g, this.Fuel.GetHtml());
        template = template.replace(/[$]fuelstyle[$]/g, " style=\"display: none;\"");
        
        template = template.replace(/[$]engine[$]/g, this.Engine.GetHtml());
        template = template.replace(/[$]enginestyle[$]/g, " style=\"display: none;\"");
        
        template = template.replace(/[$]ignition[$]/g, this.Ignition.GetHtml());
        template = template.replace(/[$]ignitionstyle[$]/g, " style=\"display: none;\"");

        return template;
    }

    SetIncrements() {
        this.Inputs.SetIncrements();
        this.Engine.SetIncrements();
        this.Fuel.SetIncrements();
        this.Ignition.SetIncrements();
    }

    GetArrayBufferPackage() {
        return (new ArrayBuffer()).build({ types: types, value: [{obj: this.GetObjPackage()}]});
    }

    GetObjPackage() {
        return { value: [
            { type: "UINT32", value: 0}, //signal last operation

            //inputs
            { type: "PackageOptions", value: { Group: 2 }}, //group
            { obj: this.Inputs.GetObjPackage()}, 
            { obj: this.Engine.GetObjPackage()}, 

            //preSync
            { type: "PackageOptions", value: { Group: 0 }}, //group

            //sync condition
            { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate return
            //no function to just use a variable so do an OR with a static false.
            { type: "Operation_Or"}, //OR
            { type: "UINT8", value: 0 }, //use variable
            { type: "UINT32", value: Increments.EngineSyncedId }, //bool
            { type: "UINT8", value: 1 }, //use first operation
            { type: "UINT8", value: 0 }, //use first return
            { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate return
            { type: "Operation_StaticVariable", value: false}, //bool
            
            //main loop execute
            { type: "PackageOptions", value: { Group: 2 }}, //group
            { obj: this.Fuel.GetObjPackage()}, 
            { obj: this.Ignition.GetObjPackage()}, 
        ]};
    }
}

class ConfigFuel {
    static Template = getFileContents("ConfigGui/Fuel.html");

    constructor(){
        this.GUID = getGUID();
        this.AFRConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            AFRConfigs,
            ValueLabel:         "Air Fuel Ratio",
            ValueMeasurement:   "Ratio",
            VariableListName:   "FuelParameters"
        });
        this.InjectorEnableConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            InjectorEnableConfigs,
            ValueLabel:         "Injector Enable",
            ValueMeasurement:   "Bool",
            VariableListName:   "FuelParameters"
        });
        this.InjectorPulseWidthConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            InjectorPulseWidthConfigs,
            ValueLabel:         "Injector Pulse Width",
            ValueMeasurement:   "Time",
            VariableListName:   "FuelParameters"
        });
        this.InjectorEndPositionConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            GenericConfigs,
            ValueLabel:         "Injector End Position(BTDC)",
            ValueMeasurement:   "Angle",
            VariableListName:   "FuelParameters"
        });
        this.ConfigInjectorOutputs = new ConfigInjectorOutputs();
    }

    AFRConfigOrVariableSelection = undefined;
    InjectorEnableConfigOrVariableSelection = undefined;
    InjectorPulseWidthConfigOrVariableSelection = undefined;
    InjectorEndPositionConfigOrVariableSelection = undefined
    ConfigInjectorOutputs = undefined

    GetValue() {
        return {
            AFRConfigOrVariableSelection: this.AFRConfigOrVariableSelection.GetValue(),
            InjectorEnableConfigOrVariableSelection: this.InjectorEnableConfigOrVariableSelection.GetValue(),
            InjectorPulseWidthConfigOrVariableSelection: this.InjectorPulseWidthConfigOrVariableSelection.GetValue(),
            InjectorEndPositionConfigOrVariableSelection: this.InjectorEndPositionConfigOrVariableSelection.GetValue(),
            ConfigInjectorOutputs: this.ConfigInjectorOutputs.GetValue()
        };
    }

    SetValue(obj) {
        this.Detach();

        this.AFRConfigOrVariableSelection.SetValue(!obj? undefined : obj.AFRConfigOrVariableSelection);
        this.InjectorEnableConfigOrVariableSelection.SetValue(!obj? undefined : obj.InjectorEnableConfigOrVariableSelection);
        this.InjectorPulseWidthConfigOrVariableSelection.SetValue(!obj? undefined : obj.InjectorPulseWidthConfigOrVariableSelection);
        this.InjectorEndPositionConfigOrVariableSelection.SetValue(!obj? undefined : obj.InjectorEndPositionConfigOrVariableSelection);
        this.ConfigInjectorOutputs.SetValue(!obj? undefined : obj.ConfigInjectorOutputs);

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        this.AFRConfigOrVariableSelection.Detach();
        this.InjectorEnableConfigOrVariableSelection.Detach();
        this.InjectorPulseWidthConfigOrVariableSelection.Detach();
        this.InjectorEndPositionConfigOrVariableSelection.Detach();
        this.ConfigInjectorOutputs.Detach();
    }

    Attach() {
        this.Detach();
        this.AFRConfigOrVariableSelection.Attach();
        this.InjectorEnableConfigOrVariableSelection.Attach();
        this.InjectorPulseWidthConfigOrVariableSelection.Attach();
        this.InjectorEndPositionConfigOrVariableSelection.Attach();
        this.ConfigInjectorOutputs.Attach();
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]afr[$]/g, this.AFRConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]injectorenable[$]/g, this.InjectorEnableConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]injectorpulsewidth[$]/g, this.InjectorPulseWidthConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]injectorendat[$]/g, this.InjectorEndPositionConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]injectoroutputs[$]/g, this.ConfigInjectorOutputs.GetHtml());
        
        return template;
    }

    CylinderFuelMassId = -1;
    SetIncrements() {
        this.AFRConfigOrVariableSelection.SetIncrements();

        this.CylinderFuelMassId = -1;
        if(Increments.FuelParameters === undefined)
            Increments.FuelParameters = [];

        this.CylinderFuelMassId = 1;
        if(Increments.VariableIncrement === undefined)
            Increments.VariableIncrement = 1;
        else
            this.CylinderFuelMassId = ++Increments.VariableIncrement;
        Increments.FuelParameters.push({ 
            Name: "Cylinder Fuel Mass", 
            Id: this.CylinderFuelMassId,
            Type: "float",
            Measurement: "Mass"
        });

        this.InjectorEnableConfigOrVariableSelection.SetIncrements();
        this.InjectorPulseWidthConfigOrVariableSelection.SetIncrements();
        this.InjectorEndPositionConfigOrVariableSelection.SetIncrements();
        this.ConfigInjectorOutputs.SetIncrements();
    }

    GetObjPackage() {
        if(Increments.VariableIncrement === undefined)
        throw "Set Increments First";
        if(this.CylinderFuelMassId === -1)
            throw "Set Increments First";

        var numberOfOperations = 2;
        if(!this.InjectorEnableConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.InjectorPulseWidthConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.InjectorEndPositionConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;

        return { value: [
            { type: "PackageOptions", value: { Group: numberOfOperations }}, //group

            { type: "PackageOptions", value: { Immediate: true, Store: true }}, //immediate store
            { type: "Operation_Divide"}, //Divide
            { type: "UINT32", value: this.CylinderFuelMassId }, //Cylinder Fuel Mass ID
            { type: "UINT8", value: 0 }, //use variable
            { type: "UINT32", value: Increments.EngineParameters.find(a => a.Name === "Cylinder Air Mass").Id },
            { obj: this.AFRConfigOrVariableSelection.GetObjAsParameter(1)}, 
            { obj: this.AFRConfigOrVariableSelection.GetObjPackage(true)}, 

            { obj: this.InjectorEnableConfigOrVariableSelection.GetObjPackage()}, 
            { obj: this.InjectorPulseWidthConfigOrVariableSelection.GetObjPackage()}, 
            { obj: this.InjectorEndPositionConfigOrVariableSelection.GetObjPackage()}, 

            { obj: this.ConfigInjectorOutputs.GetObjPackage()}, 
        ]};
    }
}

class ConfigIgnition {
    static Template = getFileContents("ConfigGui/Ignition.html");

    constructor(){
        this.GUID = getGUID();
        this.IgnitionEnableConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            IgnitionEnableConfigs,
            ValueLabel:         "Ignition Enable",
            ValueMeasurement:   "Bool",
            VariableListName:   "IgnitionParameters"
        });
        this.IgnitionAdvanceConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            IgnitionAdvanceConfigs,
            ValueLabel:         "Ignition Advance",
            ValueMeasurement:   "Angle",
            VariableListName:   "IgnitionParameters"
        });
        this.IgnitionDwellConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            IgnitionDwellConfigs,
            ValueLabel:         "Ignition Dwell",
            ValueMeasurement:   "Time",
            VariableListName:   "IgnitionParameters"
        });
        this.IgnitionDwellDeviationConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            IgnitionDwellConfigs,
            ValueLabel:         "Ignition Dwell Deviation",
            ValueMeasurement:   "Time",
            VariableListName:   "IgnitionParameters"
        });
        for(var i = 0; i < 8; i++){
            this.Outputs[i] = new ConfigTDCOutput({
                Configs:            BooleanOutputConfigs,
                ValueLabel:         "Ignition " + (i+1),
                ValueMeasurement:   "No Measurement"
            });
        }
    }

    IgnitionEnableConfigOrVariableSelection = undefined;
    IgnitionAdvanceConfigOrVariableSelection = undefined;
    IgnitionDwellConfigOrVariableSelection = undefined;
    IgnitionDwellDeviationConfigOrVariableSelection = undefined;
    Outputs = [];

    GetValue() {
        var outputObj = [];
        for(var i = 0; i < this.Outputs.length; i++){
            outputObj[i] = this.Outputs[i].GetValue();
        };
        return {
            IgnitionEnableConfigOrVariableSelection: this.IgnitionEnableConfigOrVariableSelection.GetValue(),
            IgnitionAdvanceConfigOrVariableSelection: this.IgnitionAdvanceConfigOrVariableSelection.GetValue(),
            IgnitionDwellConfigOrVariableSelection: this.IgnitionDwellConfigOrVariableSelection.GetValue(),
            IgnitionDwellDeviationConfigOrVariableSelection: this.IgnitionDwellDeviationConfigOrVariableSelection.GetValue(),
            Outputs: outputObj
        };
    }

    SetValue(obj) {
        this.Detach();
        this.IgnitionEnableConfigOrVariableSelection.SetValue(!obj? undefined : obj.IgnitionEnableConfigOrVariableSelection);
        this.IgnitionAdvanceConfigOrVariableSelection.SetValue(!obj? undefined : obj.IgnitionAdvanceConfigOrVariableSelection);
        this.IgnitionDwellConfigOrVariableSelection.SetValue(!obj? undefined : obj.IgnitionDwellConfigOrVariableSelection);
        this.IgnitionDwellDeviationConfigOrVariableSelection.SetValue(!obj? undefined : obj.IgnitionDwellDeviationConfigOrVariableSelection);
        if(obj && obj.Outputs)
        {
            this.Outputs = [];
            for(var i = 0; i < obj.Outputs.length; i++){
                if(!this.Outputs[i])
                    this.Outputs[i] = new ConfigTDCOutput({
                        Configs:            BooleanOutputConfigs,
                        ValueLabel:         "Ignition " + (i+1),
                        ValueMeasurement:   "No Measurement"
                    });
                this.Outputs[i].SetValue(obj.Outputs[i])
            }
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        this.IgnitionEnableConfigOrVariableSelection.Detach();
        this.IgnitionAdvanceConfigOrVariableSelection.Detach();
        this.IgnitionDwellConfigOrVariableSelection.Detach();
        this.IgnitionDwellDeviationConfigOrVariableSelection.Detach();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].Detach();
        };
    }

    Attach() {
        this.Detach();
        this.IgnitionEnableConfigOrVariableSelection.Attach();
        this.IgnitionAdvanceConfigOrVariableSelection.Attach();
        this.IgnitionDwellConfigOrVariableSelection.Attach();
        this.IgnitionDwellDeviationConfigOrVariableSelection.Attach();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].Attach();
        };

    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);

        template = template.replace(/[$]ignitionenable[$]/g, this.IgnitionEnableConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]ignitionadvance[$]/g, this.IgnitionAdvanceConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]ignitiondwell[$]/g, this.IgnitionDwellConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]ignitiondwelldeviation[$]/g, this.IgnitionDwellDeviationConfigOrVariableSelection.GetHtml());

        var outputsHTML = "";
        
        for(var i = 0; i < this.Outputs.length; i++){
            outputsHTML += this.Outputs[i].GetHtml();
        };
        
        template = template.replace(/[$]ignitionoutputs[$]/g, outputsHTML);

        return template;
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

    GetObjPackage() {
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
            { type: "Operation_EngineScheduleIgnition", toObj(val) {
                return { value: [
                    { type: "PackageOptions", value: { Immediate: true } }, //immediate
                    { type: "UINT32", value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleIgnition }, //factory id
                    { type: "FLOAT", value: val.TDC }, //tdc
                    { type: "PackageOptions", value: { Immediate: true, DoNotPackage: true } }, //immediate donotpackage
                    { obj: val.GetObjOperation()}, 
                    { type: "UINT8", value: 0 }, //use variable
                    { type: "UINT32", value: Increments.EnginePositionId },
                    { type: "UINT8", value: 0 }, //use variable
                    { type: "UINT32", value: Increments.IgnitionParameters.find(a => a.Name === "Ignition Enable").Id },
                    { type: "UINT8", value: 0 }, //use variable
                    { type: "UINT32", value: Increments.IgnitionParameters.find(a => a.Name === "Ignition Dwell").Id },
                    { type: "UINT8", value: 0 }, //use variable
                    { type: "UINT32", value: Increments.IgnitionParameters.find(a => a.Name === "Ignition Advance").Id },
                    { type: "UINT8", value: 0 }, //use variable
                    { type: "UINT32", value: Increments.IgnitionParameters.find(a => a.Name === "Ignition Dwell Deviation").Id },
                ]};
            }}],
        value: [
            { type: "PackageOptions", value: { Group: numberOfOperations }}, //group

            { obj: this.IgnitionEnableConfigOrVariableSelection.GetObjPackage()}, 
            { obj: this.IgnitionAdvanceConfigOrVariableSelection.GetObjPackage()}, 
            { obj: this.IgnitionDwellConfigOrVariableSelection.GetObjPackage()}, 
            { obj: this.IgnitionDwellDeviationConfigOrVariableSelection.GetObjPackage()}, 
        ]};

        for(var i = 0; i < this.Outputs.length; i++) {
            obj.value.push({ type: "Operation_EngineScheduleIgnition", value: this.Outputs[i] });
        }

        return obj;
    }
}

class ConfigEngine extends UITemplate {
    static Template = getFileContents("ConfigGui/Engine.html");

    constructor(){
        super();
        this.CrankPositionConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            undefined,
            ValueLabel:         "Crank Position",
            ValueMeasurement:   "ReluctorResult",
            VariableListName:   "EngineParameters"
        });
        this.CamPositionConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            undefined,
            ValueLabel:         "Cam Position",
            ValueMeasurement:   "ReluctorResult",
            VariableListName:   "EngineParameters"
        });
        this.CylinderAirmassConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            CylinderAirmassConfigs,
            ValueLabel:         "Cylinder Air Mass",
            ValueMeasurement:   "Mass",
            VariableListName:   "EngineParameters"
        });
        this.CylinderAirTemperatureConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            CylinderAirTemperatureConfigs,
            ValueLabel:         "Cylinder Air Temperature",
            ValueMeasurement:   "Temperature",
            VariableListName:   "EngineParameters"
        });
        this.ManifoldAbsolutePressureConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            ManifoldAbsolutePressureConfigs,
            ValueLabel:         "Manifold Absolute Pressure",
            ValueMeasurement:   "Pressure",
            VariableListName:   "EngineParameters"
        });
        this.VolumetricEfficiencyConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            VolumetricEfficiencyConfigs,
            ValueLabel:         "Volumetric Efficiency",
            ValueMeasurement:   "Percentage",
            VariableListName:   "EngineParameters"
        });
    }

    CrankPriority = 1;//static set this for now

    EnginePositionId = -1;
    EngineRPMId = -1;
    CylinderAirmassId = -1;
    SetIncrements() {
        this.CrankPositionConfigOrVariableSelection.SetIncrements();
        this.CamPositionConfigOrVariableSelection.SetIncrements();

        this.EnginePositionId = -1;
        this.EngineRPMId = -1;
        this.CylinderAirmassId = -1;

        if(Increments.EngineParameters === undefined)
        Increments.EngineParameters = [];

        this.EnginePositionId = 1;
        if(Increments.VariableIncrement === undefined)
            Increments.VariableIncrement = 1;
        else
            this.EnginePositionId = ++Increments.VariableIncrement;
        Increments.EnginePositionId = this.EnginePositionId;
        this.EngineSequentialId = ++Increments.VariableIncrement;
        Increments.EngineSequentialId = this.EngineSequentialId;
        this.EngineSyncedId = ++Increments.VariableIncrement;
        Increments.EngineSyncedId = this.EngineSyncedId;
        this.EngineRPMId = ++Increments.VariableIncrement;
        Increments.EngineParameters.push({ 
            Name: "Engine Speed", 
            Id: this.EngineRPMId,
            Type: "float",
            Measurement: "AngularSpeed"
        });

        var requirements = [];

        if(this.CylinderAirmassConfigOrVariableSelection.Selection && !this.CylinderAirmassConfigOrVariableSelection.Selection.reference) {
            requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.GetSubConfig(), "Requirements");
        }

        if(requirements && requirements.indexOf("Manifold Absolute Pressure") > -1) {
            this.ManifoldAbsolutePressureConfigOrVariableSelection.SetIncrements();
        }
        
        if(requirements && requirements.indexOf("Cylinder Air Temperature") > -1) {
            this.CylinderAirTemperatureConfigOrVariableSelection.SetIncrements();
        }

        if(requirements && requirements.indexOf("Volumetric Efficiency") > -1) {
            this.VolumetricEfficiencyConfigOrVariableSelection.SetIncrements();
        }
        
        this.CylinderAirmassConfigOrVariableSelection.SetIncrements();
    }

    GetObjPackage() {
        if(Increments.VariableIncrement === undefined)
        throw "Set Increments First";
        if(this.EngineRPMId === -1)
            throw "Set Increments First";
        if(this.EnginePositionId === -1)
            throw "Set Increments First";

        var mapRequired = false;
        var catRequired = false;
        var veRequired  = false;
        if(this.CylinderAirmassConfigOrVariableSelection.Selection && !this.CylinderAirmassConfigOrVariableSelection.Selection.reference) {
            var requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.GetSubConfig(), "Requirements");
            mapRequired = requirements && requirements.indexOf("Manifold Absolute Pressure") > -1;
            catRequired = requirements && requirements.indexOf("Cylinder Air Temperature") > -1
            veRequired = requirements && requirements.indexOf("Volumetric Efficiency") > -1;
        }

        var numberOfOperations = 1;
        if(mapRequired && !this.ManifoldAbsolutePressureConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(catRequired && !this.CylinderAirTemperatureConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(veRequired && !this.VolumetricEfficiencyConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;
        if(!this.CylinderAirmassConfigOrVariableSelection.IsVariable())
            ++numberOfOperations;



        var obj = { value: [
            { type: "PackageOptions", value: { Group: numberOfOperations }}, //group

            //big operation to setup Crank Cam position -> Engine Position -> Engine RPM
            { type: "PackageOptions", value: { Immediate: true, Store: true }}, //immediate store
            { type: "UINT32", value: EngineFactoryIDs.Offset + EngineFactoryIDs.EngineParameters },  //factory id
            { type: "UINT32", value: this.EngineRPMId },  //EngineRPMId
            { type: "UINT32", value: this.EngineSequentialId },  //EngineSequentialId
            { type: "UINT32", value: this.EngineSyncedId },  //EngineSyncedId
            { type: "UINT8", value: 1 }, //use 1st sub operation
            { type: "UINT8", value: 0 }, //use 1st return from sub operation
            { type: "PackageOptions", value: { Immediate: true, Store: true, Return: true }}, //immediate store
            { type: "UINT32", value: EngineFactoryIDs.Offset + EngineFactoryIDs.Position + ( this.CrankPriority? 0 : 1) },  //factory id
            { type: "UINT32", value: this.EnginePositionId },  //EnginePositionId
        ]};


        var subOperations = 0;
        if(!this.CrankPositionConfigOrVariableSelection.IsVariable()) 
            subOperations++;
        obj.value.push({ obj: this.CrankPositionConfigOrVariableSelection.GetObjAsParameter(subOperations) });
        if(!this.CamPositionConfigOrVariableSelection.IsVariable()) 
            subOperations++;
        obj.value.push({ obj: this.CamPositionConfigOrVariableSelection.GetObjAsParameter(subOperations) });
        obj.value.push({ obj: this.CrankPositionConfigOrVariableSelection.GetObjPackage(true) });
        obj.value.push({ obj: this.CamPositionConfigOrVariableSelection.GetObjPackage(true) });
        
        if(mapRequired) {
            obj.value.push({ obj: this.ManifoldAbsolutePressureConfigOrVariableSelection.GetObjPackage() });
        }

        if(catRequired) {
            obj.value.push({ obj: this.CylinderAirTemperatureConfigOrVariableSelection.GetObjPackage() });
        }
        
        if(veRequired) {
            obj.value.push({ obj: this.VolumetricEfficiencyConfigOrVariableSelection.GetObjPackage() });
        }
        
        var test = this.CylinderAirmassConfigOrVariableSelection.GetObjPackage();
        obj.value.push({ obj: test });

        return obj;
    }
}

class ConfigOperationCylinderAirmass_SpeedDensity extends UITemplate {
    static Name = "Speed Density";
    static Measurement = "Mass";
    static Output = "float";
    static Requirements = ["Cylinder Air Temperature", "Manifold Absolute Pressure", "Volumetric Efficiency"];
    static Template = getFileContents("ConfigGui/Engine_CylinderAirmass_SpeedDensity.html");

    constructor(){
        super();

        this.CylinderVolume = new UINumberWithMeasurement({
            Value: 0.66594,
            Step: 0.001,
            Min: 0.001,
            Measurement: "Volume"
        });
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EngineFactoryIDs.Offset + EngineFactoryIDs.CylinderAirMass_SD }, //factory ID
            { type: "FLOAT", value: this.CylinderVolume.Value }, //Cylinder Volume
        ]};
    }

    GetObjParameters() {
        return { value: [
            { type: "UINT8", value: 0 }, //use variable
            { type: "UINT32", value: Increments.EngineParameters.find(a => a.Name === "Cylinder Air Temperature").Id },
            { type: "UINT8", value: 0 }, //use variable
            { type: "UINT32", value: Increments.EngineParameters.find(a => a.Name === "Manifold Absolute Pressure").Id },
            { type: "UINT8", value: 0 }, //use variable
            { type: "UINT32", value: Increments.EngineParameters.find(a => a.Name === "Volumetric Efficiency").Id },
        ]};
    }
}
CylinderAirmassConfigs.push(ConfigOperationCylinderAirmass_SpeedDensity);

class ConfigInjectorPulseWidth_DeadTime {
    static Name = "Dead Time";
    static Output = "float";
    static Measurement = "Time";
    static Template = getFileContents("ConfigGui/Fuel_InjectorPulseWidth_DeadTime.html");

    constructor(){
        this.GUID = getGUID();
        this.FlowRateConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            GenericConfigs,
            ValueLabel:         "Injector Flow Rate",
            ValueMeasurement:   "MassFlow",
            VariableListName:   "FuelParameters"
        });
        this.DeadTimeConfigOrVariableSelection = new ConfigOrVariableSelection({
            Configs:            GenericConfigs,
            ValueLabel:         "Injector Dead Time",
            ValueMeasurement:   "Time",
            VariableListName:   "FuelParameters"
        });
    }

    FlowRateConfigOrVariableSelection = undefined;
    DeadTimeConfigOrVariableSelection = undefined;
    MinInjectorFuelMass = 0.005;

    GetValue() {
        return {
            Name: GetClassProperty(this, "Name"),
            FlowRateConfigOrVariableSelection: this.FlowRateConfigOrVariableSelection.GetValue(),
            DeadTimeConfigOrVariableSelection: this.DeadTimeConfigOrVariableSelection.GetValue(),
            MinInjectorFuelMass: this.MinInjectorFuelMass
        };
    }

    SetValue(obj) {
        this.Detach();
        if(obj && obj.MinInjectorFuelMass !== undefined)
            this.MinInjectorFuelMass = obj.MinInjectorFuelMass;
        this.FlowRateConfigOrVariableSelection.SetValue(!obj? undefined : obj.FlowRateConfigOrVariableSelection);
        this.DeadTimeConfigOrVariableSelection.SetValue(!obj? undefined : obj.DeadTimeConfigOrVariableSelection);

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
        this.FlowRateConfigOrVariableSelection.Detach();
        this.DeadTimeConfigOrVariableSelection.Detach();
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-mininjectorfuelmass", function(){
            thisClass.MinInjectorFuelMass = parseFloat($(this).val());
        });

        this.FlowRateConfigOrVariableSelection.Attach();
        this.DeadTimeConfigOrVariableSelection.Attach();
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);

        template = template.replace(/[$]flowrate[$]/g, 
            this.FlowRateConfigOrVariableSelection.GetHtml());

        template = template.replace(/[$]deadtime[$]/g, 
            this.DeadTimeConfigOrVariableSelection.GetHtml());
            
        template = template.replace(/[$]mininjectorfuelmass[$]/g, this.MinInjectorFuelMass);
        template = template.replace(/[$]mininjectorfuelmassmeasurement[$]/g, GetUnitDisplay("Mass"));

        return template;
    }

    SetIncrements() {
        this.DeadTimeConfigOrVariableSelection.SetIncrements();
        this.FlowRateConfigOrVariableSelection.SetIncrements();
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EngineFactoryIDs.Offset + EngineFactoryIDs.InjectorDeadTime },
            { type: "FLOAT", value: this.MinInjectorFuelMass }
        ]};
    }

    GetObjParameters(){
        return { value: [
            { type: "OperationParameter", value: 1 }, //use first suboperation
            { type: "VariableParameter", value: Increments.FuelParameters.find(a => a.Name === "Cylinder Fuel Mass").Id },
            { obj: this.FlowRateConfigOrVariableSelection.GetObjAsParameter(2)},
            { obj: this.DeadTimeConfigOrVariableSelection.GetObjAsParameter(!this.FlowRateConfigOrVariableSelection.IsVariable()? 3 : 2)},
            //first suboperation
            { obj: { value: [ 
                { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                { type: "Operation_Add" }, //Add
                { type: "OperationParameter", value: 1 }, //use first suboperation
                { type: "VariableParameter", value: Increments.EngineSequentialId },
                //first suboperation
                { obj: { value: [ 
                    { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                    { type: "Operation_StaticVariable", value: 1 }
                ]}},
            ]}},
            { obj: this.FlowRateConfigOrVariableSelection.GetObjPackage(true)},
            { obj: this.DeadTimeConfigOrVariableSelection.GetObjPackage(true)},
        ]};
    }
}
InjectorPulseWidthConfigs.push(ConfigInjectorPulseWidth_DeadTime);

class ConfigInjectorOutputs {
    static Name = "Injector Outputs";
    static Template = getFileContents("ConfigGui/Fuel_InjectorOutputs.html");

    constructor(){
        this.GUID = getGUID();
        for(var i = 0; i < 8; i++){
            this.Outputs[i] = new ConfigTDCOutput({
                Configs:            BooleanOutputConfigs,
                ValueLabel:         "Injector " + (i+1),
                ValueMeasurement:   "No Measurement"
            });
        }
    }

    Outputs = [];

    GetValue() {
        var outputObj = [];
        for(var i = 0; i < this.Outputs.length; i++){
            outputObj[i] = this.Outputs[i].GetValue();
        };
        return {
            Name: GetClassProperty(this, "Name"),
            Outputs: outputObj
        };
    }

    SetValue(obj) {
        this.Detach();
        if(obj && obj.Outputs)
        {
            this.Outputs = [];
            for(var i = 0; i < obj.Outputs.length; i++){
                if(!this.Outputs[i])
                    this.Outputs[i] = new ConfigTDCOutput({
                        Configs:            BooleanOutputConfigs,
                        ValueLabel:         "Injector " + (i+1),
                        ValueMeasurement:   "No Measurement"
                    });
                this.Outputs[i].SetValue(obj.Outputs[i])
            }
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].Detach();
        };
    }

    Attach() {
        this.Detach();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].Attach();
        };
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);

        var outputsHTML = "";
        
        for(var i = 0; i < this.Outputs.length; i++){
            outputsHTML += this.Outputs[i].GetHtml();
        };
        
        template = template.replace(/[$]injectoroutputs[$]/g, outputsHTML);

        return template;
    }

    SetIncrements() {
        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].SetIncrements();
        };
    }

    GetObjPackage() {

        var obj  = { 
            types : [
                { type: "Operation_EngineScheduleInjection", toObj(val) {
                    return { value: [
                        { type: "PackageOptions", value: { Immediate: true } }, //immediate
                        { type: "UINT32", value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleInjection }, //factory id
                        { type: "FLOAT", value: val.TDC }, //tdc
                        { type: "PackageOptions", value: { Immediate: true, DoNotPackage: true } }, //immediate donotpackage
                        { obj: val.GetObjOperation()}, 
                        { type: "UINT8", value: 0 }, //use variable
                        { type: "UINT32", value: Increments.EnginePositionId },
                        { type: "UINT8", value: 0 }, //use variable
                        { type: "UINT32", value: Increments.FuelParameters.find(a => a.Name === "Injector Enable").Id },
                        { type: "UINT8", value: 0 }, //use variable
                        { type: "UINT32", value: Increments.FuelParameters.find(a => a.Name === "Injector Pulse Width").Id },
                        { type: "UINT8", value: 0 }, //use variable
                        { type: "UINT32", value: Increments.FuelParameters.find(a => a.Name === "Injector End Position(BTDC)").Id },
                    ]};
                }}],
            value: [
                { type: "PackageOptions", value: { Group: this.Outputs.length }}, //group
            ]};
    
        for(var i = 0; i < this.Outputs.length; i++) {
            obj.value.push({ type: "Operation_EngineScheduleInjection", value: this.Outputs[i] });
        }

        return obj;
    }
}

class ConfigTDCOutput extends ConfigOrVariableSelection {
    static Template =
        "<div id=\"$GUID$\">" +
        "<label for=\"$TDC.GUID$\"><div style=\"display: inline-block;\">$ValueLabel$</div>:&nbsp;&nbsp;&nbsp;TDC:$TDC$° &nbsp;&nbsp;&nbsp;Output:</label>$Selection$ $ConfigValue$" +
        "</div>";

    constructor(prop) {
        super(prop);

        this.TDC = new UINumber({
            Value: 0,
            Step: 1,
            Min: 0,
            Max: 720
        })
    }
}