var Increments = {};
var AFRConfigs = [];
AFRConfigs.push(ConfigOperation_Static);
AFRConfigs.push(ConfigOperation_LookupTable);
AFRConfigs.push(ConfigOperation_2AxisTable);
var InjectorPulseWidthConfigs = [];
// InjectorPulseWidthConfigs.push(ConfigOperation_Static);
// InjectorPulseWidthConfigs.push(ConfigOperation_LookupTable);
// InjectorPulseWidthConfigs.push(ConfigOperation_2AxisTable);
var IgnitionAdvanceConfigs = [];
IgnitionAdvanceConfigs.push(ConfigOperation_Static);
IgnitionAdvanceConfigs.push(ConfigOperation_LookupTable);
IgnitionAdvanceConfigs.push(ConfigOperation_2AxisTable);
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
    ScheduleInjection: 7
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

        if(typeof val === "boolean"){
            obj.value.push({ type: "UINT8", value: 11 }); //type
            obj.value.push({ type: "BOOL", value: val }); //type
        } else if(val % 1 != 0){
            obj.value.push({ type: "UINT8", value: 9 }); //type
            obj.value.push({ type: "FLOAT", value: val }); //type
        } else {
            if(val < 0) {
                if(val < 128 && val > -129) {
                    obj.value.push({ type: "UINT8", value: 5 }); //type
                    obj.value.push({ type: "INT8", value: val }); //type
                } else if(val < 32768 && val > -32759) {
                    obj.value.push({ type: "UINT8", value: 6 }); //type
                    obj.value.push({ type: "INT16", value: val }); //type
                } else if(val < 2147483648 && val > -2147483649) {
                    obj.value.push({ type: "UINT8", value: 7 }); //type
                    obj.value.push({ type: "INT32", value: val }); //type
                } else if(val < 9223372036854775807 && val > -9223372036854775808){
                    obj.value.push({ type: "UINT8", value: 8 }); //type
                    obj.value.push({ type: "INT64", value: val }); //type
                } else {
                    throw "number too big";
                }
            } else {
                if(val < 256) {
                    obj.value.push({ type: "UINT8", value: 1 }); //type
                    obj.value.push({ type: "INT8", value: val }); //type
                } else if(val < 65536) {
                    obj.value.push({ type: "UINT8", value: 2 }); //type
                    obj.value.push({ type: "UINT16", value: val }); //type
                } else if(val < 4294967295) {
                    obj.value.push({ type: "UINT8", value: 3 }); //type
                    obj.value.push({ type: "UINT32", value: val }); //type
                } else if(val < 18446744073709551615) {
                    obj.value.push({ type: "UINT8", value: 4 }); //type
                    obj.value.push({ type: "UINT64", value: val }); //type
                } else {
                    throw "number too big";
                }
            }
        }

        return obj;
    }},
    { type: "Operation_Math", toObj(val) {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Math}, //number of operations
            { type: "UINT8", value: val } //operator
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
    
    GetObj() {
        return { 
            Inputs: this.Inputs.GetObj(),
            Engine: this.Engine.GetObj(),
            Fuel: this.Fuel.GetObj(),
            Ignition: this.Ignition.GetObj()
        };
    }

    SetObj(obj) {
        this.Detach();
        this.Inputs = new ConfigInputs();
        this.Engine = new ConfigEngine();
        this.Fuel = new ConfigFuel();
        this.Ignition = new ConfigIgnition();

        this.Inputs.SetObj(!obj? undefined : obj.Inputs);
        this.Engine.SetObj(!obj? undefined : obj.Engine);
        this.Fuel.SetObj(!obj? undefined : obj.Fuel);
        this.Ignition.SetObj(!obj? undefined : obj.Ignition);

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        ResetIncrements();//this is top level object so reset increments. this is not elegant
        this.Inputs.Detach();
        this.Engine.Detach();
        this.Fuel.Detach();
        this.Ignition.Detach();

        $(document).off("click."+this.GUID);
    }

    Attach() {
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

        $(document).on("click."+this.GUID, "#" + this.GUID + "-inputstab", function(){
            thisClass.Detach();

            $("#" + thisClass.GUID + "-inputs").show();
            $("#" + thisClass.GUID + "-inputstab").addClass("active");
            $("#" + thisClass.GUID + "-engine").hide();
            $("#" + thisClass.GUID + "-enginetab").removeClass("active");
            $("#" + thisClass.GUID + "-fuel").hide();
            $("#" + thisClass.GUID + "-fueltab").removeClass("active");
            $("#" + thisClass.GUID + "-ignition").hide();
            $("#" + thisClass.GUID + "-ignitiontab").removeClass("active");

            thisClass.Attach();
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-enginetab", function(){
            thisClass.Detach();

            $("#" + thisClass.GUID + "-inputs").hide();
            $("#" + thisClass.GUID + "-inputstab").removeClass("active");
            $("#" + thisClass.GUID + "-engine").show();
            $("#" + thisClass.GUID + "-enginetab").addClass("active");
            $("#" + thisClass.GUID + "-fuel").hide();
            $("#" + thisClass.GUID + "-fueltab").removeClass("active");
            $("#" + thisClass.GUID + "-ignition").hide();
            $("#" + thisClass.GUID + "-ignitiontab").removeClass("active");

            thisClass.Attach();
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-fueltab", function(){
            thisClass.Detach();
            
            $("#" + thisClass.GUID + "-inputs").hide();
            $("#" + thisClass.GUID + "-inputstab").removeClass("active");
            $("#" + thisClass.GUID + "-engine").hide();
            $("#" + thisClass.GUID + "-enginetab").removeClass("active");
            $("#" + thisClass.GUID + "-fuel").show();
            $("#" + thisClass.GUID + "-fueltab").addClass("active");
            $("#" + thisClass.GUID + "-ignition").hide();
            $("#" + thisClass.GUID + "-ignitiontab").removeClass("active");

            thisClass.Attach();
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-ignitiontab", function(){
            thisClass.Detach();
            
            $("#" + thisClass.GUID + "-inputs").hide();
            $("#" + thisClass.GUID + "-inputstab").removeClass("active");
            $("#" + thisClass.GUID + "-engine").hide();
            $("#" + thisClass.GUID + "-enginetab").removeClass("active");
            $("#" + thisClass.GUID + "-fuel").hide();
            $("#" + thisClass.GUID + "-fueltab").removeClass("active");
            $("#" + thisClass.GUID + "-ignition").show();
            $("#" + thisClass.GUID + "-ignitiontab").addClass("active");

            thisClass.Attach();
        });
    }

    GetIATSelections() {
        var available = false;
        var selections = "";
        if(this.RawConfig)
        {
            var output = this.RawConfig.constructor.Output;
            var translationSelected = false;
            if(output !== undefined)
            {
                for(var i = 0; i < InputTranslationConfigs.length; i++)
                {
                    var inputs = InputTranslationConfigs[i].Inputs;
                    if(inputs.length !== 1 || inputs[0] !== output)
                        continue;

                    var selected = false;
                    if(this.TranslationConfig && this.TranslationConfig instanceof InputTranslationConfigs[i]){
                        selected = true;
                        translationSelected = true;
                    }

                    translationSelections += "<option value=\"" + i + "\"" + (selected? " selected" : "") + ">" + InputTranslationConfigs[i].Name + "</option>"
                    availableTranslation = true;
                }
            }

            if(!translationSelected) {
                this.TranslationConfig = undefined;
                $("#" + this.GUID + "-translation").html("");
            }

            if(availableTranslation){
                translationSelections = "<option value=\"-1\"" + (translationSelected? "" : " selected") + ">None</option>" + translationSelections;
            } else {
                translationSelections = "<option value=\"-1\" disabled selected>None</option>";
            }
        } else {
            this.TranslationConfig = undefined;
            $("#" + this.GUID + "-translation").html("");
            translationSelections = "<option value=\"-1\">Select Raw First</option>"
        }
        return { Html : translationSelections, Available: availableTranslation };
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);

        template = template.replace(/[$]inputs[$]/g, this.Inputs.GetHtml());
        template = template.replace(/[$]inputsstyle[$]/g, "");
        template = template.replace(/[$]inputstabclassses[$]/g, " active");
        
        template = template.replace(/[$]fuel[$]/g, this.Fuel.GetHtml());
        template = template.replace(/[$]fuelstyle[$]/g, " style=\"display: none;\"");
        template = template.replace(/[$]fueltabclassses[$]/g, "");
        
        template = template.replace(/[$]engine[$]/g, this.Engine.GetHtml());
        template = template.replace(/[$]enginestyle[$]/g, " style=\"display: none;\"");
        template = template.replace(/[$]enginetabclassses[$]/g, "");
        
        template = template.replace(/[$]ignition[$]/g, this.Ignition.GetHtml());
        template = template.replace(/[$]ignitionstyle[$]/g, " style=\"display: none;\"");
        template = template.replace(/[$]ignitiontabclassses[$]/g, "");

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
            { type: "Operation_Math", value: 5}, //OR
            { type: "UINT8", value: 0 }, //use variable
            { type: "UINT32", value: Increments.EngineSequentialId }, //bool
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
        this.AFRConfigOrVariableSelection = new ConfigOrVariableSelection(
            AFRConfigs,
            "Air Fuel Ratio",
            "Ratio",
            "FuelParameters");
        this.InjectorPulseWidthConfigOrVariableSelection = new ConfigOrVariableSelection(
            InjectorPulseWidthConfigs,
            "Injector Pulse Width",
            "Time",
            "FuelParameters");
        this.InjectorEndPositionConfigOrVariableSelection = new ConfigOrVariableSelection(
            GenericConfigs,
            "Injector End Position(ATDC)",
            "Angle",
            "FuelParameters");
        this.ConfigInjectorOutputs = new ConfigInjectorOutputs();
    }

    AFRConfigOrVariableSelection = undefined;
    InjectorPulseWidthConfigOrVariableSelection = undefined;
    InjectorEndPositionConfigOrVariableSelection = undefined
    ConfigInjectorOutputs = undefined

    GetObj() {
        return {
            AFRConfigOrVariableSelection: this.AFRConfigOrVariableSelection.GetObj(),
            InjectorPulseWidthConfigOrVariableSelection: this.InjectorPulseWidthConfigOrVariableSelection.GetObj(),
            InjectorEndPositionConfigOrVariableSelection: this.InjectorEndPositionConfigOrVariableSelection.GetObj(),
            ConfigInjectorOutputs: this.ConfigInjectorOutputs.GetObj()
        };
    }

    SetObj(obj) {
        this.Detach();

        this.AFRConfigOrVariableSelection.SetObj(!obj? undefined : obj.AFRConfigOrVariableSelection);
        this.InjectorPulseWidthConfigOrVariableSelection.SetObj(!obj? undefined : obj.InjectorPulseWidthConfigOrVariableSelection);
        this.InjectorEndPositionConfigOrVariableSelection.SetObj(!obj? undefined : obj.InjectorEndPositionConfigOrVariableSelection);
        this.ConfigInjectorOutputs.SetObj(!obj? undefined : obj.ConfigInjectorOutputs);

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        this.AFRConfigOrVariableSelection.Detach();
        this.InjectorPulseWidthConfigOrVariableSelection.Detach();
        this.InjectorEndPositionConfigOrVariableSelection.Detach();
        this.ConfigInjectorOutputs.Detach();
    }

    Attach() {
        this.AFRConfigOrVariableSelection.Attach();
        this.InjectorPulseWidthConfigOrVariableSelection.Attach();
        this.InjectorEndPositionConfigOrVariableSelection.Attach();
        this.ConfigInjectorOutputs.Attach();
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]afr[$]/g, this.AFRConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]injectorpulsewidth[$]/g, this.InjectorPulseWidthConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]injectorendat[$]/g, this.InjectorEndPositionConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]injectoroutputs[$]/g, this.ConfigInjectorOutputs.GetHtml());
        
        return template;
    }

    InjectorMassId = -1;
    SetIncrements() {
        this.AFRConfigOrVariableSelection.SetIncrements();

        this.InjectorMassId = -1;
        if(Increments.FuelParameters === undefined)
            Increments.FuelParameters = [];

        this.InjectorMassId = 1;
        if(Increments.VariableIncrement === undefined)
            Increments.VariableIncrement = 1;
        else
            this.InjectorMassId = ++Increments.VariableIncrement;
        Increments.FuelParameters.push({ 
            Name: "Injector Mass", 
            Id: this.InjectorMassId,
            Type: "float",
            Measurement: "Mass"
        });

        this.InjectorPulseWidthConfigOrVariableSelection.SetIncrements();
        this.InjectorEndPositionConfigOrVariableSelection.SetIncrements();
        this.ConfigInjectorOutputs.SetIncrements();
    }

    GetObjPackage() {
        if(Increments.VariableIncrement === undefined)
        throw "Set Increments First";
        if(this.InjectorMassId === -1)
            throw "Set Increments First";

        var numberOfOperations = 2;
        if(this.InjectorPulseWidthConfigOrVariableSelection.IsImmediateOperation())
            ++numberOfOperations;
        if(this.InjectorEndPositionConfigOrVariableSelection.IsImmediateOperation())
            ++numberOfOperations;

        return { value: [
            { type: "PackageOptions", value: { Group: numberOfOperations }}, //group

            { type: "PackageOptions", value: { Immediate: true, Store: true }}, //immediate store
            { type: "Operation_Math", value: 3}, //Divide
            { type: "UINT32", value: this.InjectorMassId }, //Injector Mass ID
            { type: "UINT8", value: 0 }, //use variable
            { type: "UINT32", value: Increments.EngineParameters.find(a => a.Name === "Cylinder Air Mass").Id },
            { obj: this.AFRConfigOrVariableSelection.GetObjAsParameter(1)}, 
            { obj: this.AFRConfigOrVariableSelection.GetObjPackage(true)}, 

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
        this.IgnitionAdvanceConfigOrVariableSelection = new ConfigOrVariableSelection(
            IgnitionAdvanceConfigs,
            "Ignition Advance",
            "Angle",
            "IgnitionParameters");
        this.IgnitionDwellConfigOrVariableSelection = new ConfigOrVariableSelection(
            IgnitionDwellConfigs,
            "Ignition Dwell",
            "Time",
            "IgnitionParameters");
        this.Outputs[0] = new ConfigTDCOutput(BooleanOutputConfigs, "Ignition 1", "No Measurement");
        this.Outputs[1] = new ConfigTDCOutput(BooleanOutputConfigs, "Ignition 2", "No Measurement");
        this.Outputs[2] = new ConfigTDCOutput(BooleanOutputConfigs, "Ignition 3", "No Measurement");
        this.Outputs[3] = new ConfigTDCOutput(BooleanOutputConfigs, "Ignition 4", "No Measurement");
        this.Outputs[4] = new ConfigTDCOutput(BooleanOutputConfigs, "Ignition 5", "No Measurement");
        this.Outputs[5] = new ConfigTDCOutput(BooleanOutputConfigs, "Ignition 6", "No Measurement");
        this.Outputs[6] = new ConfigTDCOutput(BooleanOutputConfigs, "Ignition 7", "No Measurement");
        this.Outputs[7] = new ConfigTDCOutput(BooleanOutputConfigs, "Ignition 8", "No Measurement");
    }

    IgnitionAdvanceConfigOrVariableSelection = undefined;
    IgnitionDwellConfigOrVariableSelection = undefined;
    Outputs = [];

    GetObj() {
        var outputObj = [];
        for(var i = 0; i < this.Outputs.length; i++){
            outputObj[i] = this.Outputs[i].GetObj();
        };
        return {
            IgnitionAdvanceConfigOrVariableSelection: this.IgnitionAdvanceConfigOrVariableSelection.GetObj(),
            IgnitionDwellConfigOrVariableSelection: this.IgnitionDwellConfigOrVariableSelection.GetObj(),
            Outputs: outputObj
        };
    }

    SetObj(obj) {
        this.Detach();
        this.IgnitionAdvanceConfigOrVariableSelection.SetObj(!obj? undefined : obj.IgnitionAdvanceConfigOrVariableSelection);
        this.IgnitionDwellConfigOrVariableSelection.SetObj(!obj? undefined : obj.IgnitionDwellConfigOrVariableSelection);
        if(obj && obj.Outputs)
        {
            this.Outputs = [];
            for(var i = 0; i < obj.Outputs.length; i++){
                if(!this.Outputs[i])
                    this.Outputs[i] = new ConfigTDCOutput(BooleanOutputConfigs, "Ignition " + (i+1), "No Measurement")
                this.Outputs[i].SetObj(obj.Outputs[i])
            }
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        this.IgnitionAdvanceConfigOrVariableSelection.Detach();
        this.IgnitionDwellConfigOrVariableSelection.Detach();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].Detach();
        };
    }

    Attach() {
        this.IgnitionAdvanceConfigOrVariableSelection.Attach();
        this.IgnitionDwellConfigOrVariableSelection.Attach();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].Attach();
        };

    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);

        template = template.replace(/[$]ignitionadvance[$]/g, this.IgnitionAdvanceConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]ignitiondwell[$]/g, this.IgnitionDwellConfigOrVariableSelection.GetHtml());

        var outputsHTML = "";
        
        for(var i = 0; i < this.Outputs.length; i++){
            outputsHTML += this.Outputs[i].GetHtml();
        };
        
        template = template.replace(/[$]ignitionoutputs[$]/g, outputsHTML);

        return template;
    }

    SetIncrements() {
        this.IgnitionAdvanceConfigOrVariableSelection.SetIncrements();
        this.IgnitionDwellConfigOrVariableSelection.SetIncrements();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].SetIncrements();
        };
    }

    GetObjPackage() {
        var numberOfOperations = this.Outputs.length;
        if(this.IgnitionAdvanceConfigOrVariableSelection.IsImmediateOperation())
            ++numberOfOperations;
        if(this.IgnitionDwellConfigOrVariableSelection.IsImmediateOperation())
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
                    { type: "UINT32", value: Increments.IgnitionParameters.find(a => a.Name === "Ignition Dwell").Id },
                    { type: "UINT8", value: 0 }, //use variable
                    { type: "UINT32", value: Increments.IgnitionParameters.find(a => a.Name === "Ignition Advance").Id },
                ]};
            }}],
        value: [
            { type: "PackageOptions", value: { Group: numberOfOperations }}, //group

            { obj: this.IgnitionAdvanceConfigOrVariableSelection.GetObjPackage()}, 
            { obj: this.IgnitionDwellConfigOrVariableSelection.GetObjPackage()}, 
        ]};

        for(var i = 0; i < this.Outputs.length; i++) {
            obj.value.push({ type: "Operation_EngineScheduleIgnition", value: this.Outputs[i] });
        }

        return obj;
    }
}

class ConfigEngine {
    static Template = getFileContents("ConfigGui/Engine.html");

    constructor(){
        this.GUID = getGUID();
        this.CrankPositionConfigOrVariableSelection = new ConfigOrVariableSelection(
            undefined,
            "Crank Position",
            "ReluctorResult",
            "EngineParameters");
        this.CamPositionConfigOrVariableSelection = new ConfigOrVariableSelection(
            undefined,
            "Cam Position",
            "ReluctorResult",
            "EngineParameters");
        this.CylinderAirmassConfigOrVariableSelection = new ConfigOrVariableSelection(
            CylinderAirmassConfigs,
            "Cylinder Air Mass",
            "Mass",
            "EngineParameters");
        this.CylinderAirTemperatureConfigOrVariableSelection = new ConfigOrVariableSelection(
            CylinderAirTemperatureConfigs,
            "Cylinder Air Temperature",
            "Temperature",
            "EngineParameters");
        this.ManifoldAbsolutePressureConfigOrVariableSelection = new ConfigOrVariableSelection(
            ManifoldAbsolutePressureConfigs,
            "Manifold Absolute Pressure",
            "Pressure",
            "EngineParameters");
        this.VolumetricEfficiencyConfigOrVariableSelection = new ConfigOrVariableSelection(
            VolumetricEfficiencyConfigs,
            "Volumetric Efficiency",
            "Percentage",
            "EngineParameters");
    }

    CrankPriority = 1;//static set this for now

    CrankPositionConfigOrVariableSelection = undefined;
    CamPositionConfigOrVariableSelection = undefined;
    CylinderAirmassConfigOrVariableSelection = undefined;
    CylinderAirTemperatureConfigOrVariableSelection = undefined;
    ManifoldAbsolutePressureConfigOrVariableSelection = undefined;
    VolumetricEfficiencyConfigOrVariableSelection = undefined;

    GetObj() {
        return { 
            CrankPositionConfigOrVariableSelection: this.CrankPositionConfigOrVariableSelection.GetObj(),
            CamPositionConfigOrVariableSelection: this.CamPositionConfigOrVariableSelection.GetObj(),
            CylinderAirmassConfigOrVariableSelection: this.CylinderAirmassConfigOrVariableSelection.GetObj(),
            CylinderAirTemperatureConfigOrVariableSelection :this.CylinderAirTemperatureConfigOrVariableSelection.GetObj(),
            ManifoldAbsolutePressureConfigOrVariableSelection :this.ManifoldAbsolutePressureConfigOrVariableSelection.GetObj(),
            VolumetricEfficiencyConfigOrVariableSelection :this.VolumetricEfficiencyConfigOrVariableSelection.GetObj()
        };
    }

    SetObj(obj) {
        this.Detach();
        this.CrankPositionConfigOrVariableSelection.SetObj(!obj? undefined : obj.CrankPositionConfigOrVariableSelection);
        this.CamPositionConfigOrVariableSelection.SetObj(!obj? undefined : obj.CamPositionConfigOrVariableSelection);
        this.CylinderAirmassConfigOrVariableSelection.SetObj(!obj? undefined : obj.CylinderAirmassConfigOrVariableSelection);
        this.CylinderAirTemperatureConfigOrVariableSelection.SetObj(!obj? undefined : obj.CylinderAirTemperatureConfigOrVariableSelection);
        this.ManifoldAbsolutePressureConfigOrVariableSelection.SetObj(!obj? undefined : obj.ManifoldAbsolutePressureConfigOrVariableSelection);
        this.VolumetricEfficiencyConfigOrVariableSelection.SetObj(!obj? undefined : obj.VolumetricEfficiencyConfigOrVariableSelection);

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);      
        this.CrankPositionConfigOrVariableSelection.Detach();
        this.CamPositionConfigOrVariableSelection.Detach();
        this.CylinderAirmassConfigOrVariableSelection.Detach();
        this.CylinderAirTemperatureConfigOrVariableSelection.Detach();
        this.ManifoldAbsolutePressureConfigOrVariableSelection.Detach();
        this.VolumetricEfficiencyConfigOrVariableSelection.Detach();
    }

    Attach() {
        this.CrankPositionConfigOrVariableSelection.Attach();
        this.CamPositionConfigOrVariableSelection.Attach();
        this.CylinderAirmassConfigOrVariableSelection.Attach();
        this.CylinderAirTemperatureConfigOrVariableSelection.Attach();
        this.ManifoldAbsolutePressureConfigOrVariableSelection.Attach();
        this.VolumetricEfficiencyConfigOrVariableSelection.Attach();

        var thisClass = this;
        $(document).on("change."+this.GUID, "#" + this.CylinderAirmassConfigOrVariableSelection.GUID + "-selection", function(){
            thisClass.Detach();

            //There might be a better way to repopulate requirements. this is quick and easy for now.
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        
        var requirements = [];

        if(this.CylinderAirmassConfigOrVariableSelection.Selection && !this.CylinderAirmassConfigOrVariableSelection.Selection.reference) {
            requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.Selection.value, "Requirements");
        }
        
        template = template.replace(/[$]crankposition[$]/g, 
            this.CrankPositionConfigOrVariableSelection.GetHtml());

        template = template.replace(/[$]camposition[$]/g, 
            this.CamPositionConfigOrVariableSelection.GetHtml());

        template = template.replace(/[$]cylinderairmass[$]/g, 
            this.CylinderAirmassConfigOrVariableSelection.GetHtml());
        
        template = template.replace(/[$]cylinderairtemperature[$]/g, 
            requirements && requirements.indexOf("Cylinder Air Temperature") > -1? 
            this.CylinderAirTemperatureConfigOrVariableSelection.GetHtml() : "");
        
        template = template.replace(/[$]manifoldabsolutepressure[$]/g, 
            requirements && requirements.indexOf("Manifold Absolute Pressure") > -1? 
            this.ManifoldAbsolutePressureConfigOrVariableSelection.GetHtml() : "");

        template = template.replace(/[$]volumetricefficiency[$]/g, 
            requirements && requirements.indexOf("Volumetric Efficiency") > -1? 
            this.VolumetricEfficiencyConfigOrVariableSelection.GetHtml() : "");

        return template;
    }

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
        this.EngineRPMId = ++Increments.VariableIncrement;
        Increments.EngineParameters.push({ 
            Name: "Engine RPM", 
            Id: this.EngineRPMId,
            Type: "float",
            Measurement: "AngularSpeed"
        });

        var requirements = [];

        if(this.CylinderAirmassConfigOrVariableSelection.Selection && !this.CylinderAirmassConfigOrVariableSelection.Selection.reference) {
            requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.Selection.value, "Requirements");
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
            var requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.Selection.value, "Requirements");
            mapRequired = requirements && requirements.indexOf("Manifold Absolute Pressure") > -1;
            catRequired = requirements && requirements.indexOf("Cylinder Air Temperature") > -1
            veRequired = requirements && requirements.indexOf("Volumetric Efficiency") > -1;
        }

        var numberOfOperations = 1;
        if(mapRequired && this.ManifoldAbsolutePressureConfigOrVariableSelection.IsImmediateOperation())
            ++numberOfOperations;
        if(catRequired && this.CylinderAirTemperatureConfigOrVariableSelection.IsImmediateOperation())
            ++numberOfOperations;
        if(veRequired && this.VolumetricEfficiencyConfigOrVariableSelection.IsImmediateOperation())
            ++numberOfOperations;
        if(this.CylinderAirmassConfigOrVariableSelection.IsImmediateOperation())
            ++numberOfOperations;



        var obj = { value: [
            { type: "PackageOptions", value: { Group: numberOfOperations }}, //group

            //big operation to setup Crank Cam position -> Engine Position -> Engine RPM
            { type: "PackageOptions", value: { Immediate: true, Store: true }}, //immediate store
            { type: "UINT32", value: EngineFactoryIDs.Offset + EngineFactoryIDs.EngineParameters },  //factory id
            { type: "UINT32", value: this.EngineRPMId },  //EngineRPMId
            { type: "UINT32", value: this.EngineSequentialId },  //EngineSequentialId
            { type: "UINT8", value: 1 }, //use 1st sub operation
            { type: "UINT8", value: 0 }, //use 1st return from sub operation
            { type: "PackageOptions", value: { Immediate: true, Store: true, Return: true }}, //immediate store
            { type: "UINT32", value: EngineFactoryIDs.Offset + EngineFactoryIDs.Position },  //factory id
            { type: "UINT8", value: this.CrankPriority? 1 : 0 }, //CrankPriority
            { type: "UINT32", value: this.EnginePositionId },  //EnginePositionId
        ]};


        var subOperations = 0;
        if(this.CrankPositionConfigOrVariableSelection.IsImmediateOperation()) 
            subOperations++;
        obj.value.push({ obj: this.CrankPositionConfigOrVariableSelection.GetObjAsParameter(subOperations) });
        if(this.CamPositionConfigOrVariableSelection.IsImmediateOperation()) 
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

class ConfigOperationCylinderAirmass_SpeedDensity {
    static Name = "Speed Density";
    static Measurement = "Mass";
    static Output = "float";
    static Requirements = ["Cylinder Air Temperature", "Manifold Absolute Pressure", "Volumetric Efficiency"];
    static Template = getFileContents("ConfigGui/Engine_CylinderAirmass_SpeedDensity.html");

    constructor(){
        this.GUID = getGUID();
    }

    Type = "number";
    CylinderVolume = 0.66594;

    GetObj() {
        return {
            Name: GetClassProperty(this, "Name"),
            CylinderVolume: this.CylinderVolume
        };
    }

    SetObj(obj) {
        this.Detach();
        if(obj)
            this.CylinderVolume = obj.CylinderVolume;

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-cylindervolume", function(){
            thisClass.Detach();

            thisClass.CylinderVolume = parseFloat($(this).val());

            thisClass.Attach();
        });


    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]cylindervolume[$]/g, this.CylinderVolume);
        template = template.replace(/[$]cylindervolumemeasurement[$]/g, GetMeasurementDisplay(Measurements["Volume"]));
        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EngineFactoryIDs.Offset + EngineFactoryIDs.CylinderAirMass_SD }, //factory ID
            { type: "FLOAT", value: this.CylinderVolume }, //Cylinder Volume
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
        this.FlowRateConfigOrVariableSelection = new ConfigOrVariableSelection(
            GenericConfigs,
            "Injector Flow Rate",
            "MassFlow",
            "FuelParameters");
        this.DeadTimeConfigOrVariableSelection = new ConfigOrVariableSelection(
            GenericConfigs,
            "Injector Dead Time",
            "Time",
            "FuelParameters");
    }

    FlowRateConfigOrVariableSelection = undefined;
    DeadTimeConfigOrVariableSelection = undefined;

    GetObj() {
        return {
            Name: GetClassProperty(this, "Name"),
            FlowRateConfigOrVariableSelection: this.FlowRateConfigOrVariableSelection.GetObj(),
            DeadTimeConfigOrVariableSelection: this.DeadTimeConfigOrVariableSelection.GetObj(),
        };
    }

    SetObj(obj) {
        this.Detach();
        this.FlowRateConfigOrVariableSelection.SetObj(!obj? undefined : obj.FlowRateConfigOrVariableSelection);
        this.DeadTimeConfigOrVariableSelection.SetObj(!obj? undefined : obj.DeadTimeConfigOrVariableSelection);

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        this.FlowRateConfigOrVariableSelection.Detach();
        this.DeadTimeConfigOrVariableSelection.Detach();
    }

    Attach() {
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

        return template;
    }

    SetIncrements() {
        this.DeadTimeConfigOrVariableSelection.SetIncrements();
        this.FlowRateConfigOrVariableSelection.SetIncrements();
    }

    GetObjOperation() {

        return { value: [
            { type: "Operation_Math", value: 2}, //Multiply
        ]};
    }

    GetObjParameters(){
        return { value: [
            { type: "UINT8", value: 1 }, //use first suboperation
            { type: "UINT8", value: 0 }, //use first return
            { type: "UINT8", value: 2 }, //use second suboperation
            { type: "UINT8", value: 0 }, //use first return
            //first suboperation
            { obj: { value: [ 
                { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                { type: "Operation_Math", value: 6 }, //GreaterThan
                { type: "UINT8", value: 0 }, //use variable
                { type: "UINT32", value: Increments.FuelParameters.find(a => a.Name === "Injector Mass").Id }, //Injector Mass ID
                { type: "UINT8", value: 1 }, //use first suboperation
                { type: "UINT8", value: 0 }, //use first return
                //first suboperation
                { obj: { value: [ 
                    { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                    { type: "Operation_StaticVariable", value: 0 }
                ]}},
            ]}},

            //second suboperation
            { obj: { value: [ 
                { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                { type: "Operation_Math", value: 0 }, //Add
                { type: "UINT8", value: 1 }, //use first suboperation
                { type: "UINT8", value: 0 }, //use first return
                { obj: this.DeadTimeConfigOrVariableSelection.GetObjAsParameter(2)},
                //first suboperation
                { obj: { value: [ 
                    { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                    { type: "Operation_Math", value: 2 }, //Multiply
                    { type: "UINT8", value: 1 }, //use first suboperation
                    { type: "UINT8", value: 0 }, //use first return
                    { type: "UINT8", value: 2 }, //use second suboperation
                    { type: "UINT8", value: 0 }, //use first return
                    //first suboperation
                    { obj: { value: [ 
                        { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                        { type: "Operation_Math", value: 2 }, //Multiply
                        { type: "UINT8", value: 1 }, //use first suboperation
                        { type: "UINT8", value: 0 }, //use first return
                        { type: "UINT8", value: 2 }, //use second suboperation
                        { type: "UINT8", value: 0 }, //use first return
                        //first suboperation
                        { obj: { value: [ 
                            { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                            { type: "Operation_StaticVariable", value: 0.5 }
                        ]}},
                        //second suboperation
                        { obj: { value: [ 
                            { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                            { type: "Operation_Math", value: 0 }, //Add
                            { type: "UINT8", value: 1 }, //use first suboperation
                            { type: "UINT8", value: 0 }, //use first return
                            { type: "UINT8", value: 0 }, //use variable
                            { type: "UINT32", value: Increments.EngineSequentialId },
                            //first suboperation
                            { obj: { value: [ 
                                { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                                { type: "Operation_StaticVariable", value: 1 }
                            ]}},
                        ]}},
                    ]}},
                    //second suboperation
                    { obj: { value: [ 
                        { type: "PackageOptions", value: { Immediate: true, Return: true }}, //immediate and return
                        { type: "Operation_Math", value: 3 }, //Divide
                        { type: "UINT8", value: 0 }, //use variable
                        { type: "UINT32", value: Increments.FuelParameters.find(a => a.Name === "Injector Mass").Id },
                        { obj: this.FlowRateConfigOrVariableSelection.GetObjAsParameter(1)},
                        { obj: this.FlowRateConfigOrVariableSelection.GetObjPackage(true)},
                    ]}},
                ]}},
                { obj: this.DeadTimeConfigOrVariableSelection.GetObjPackage(true)},
            ]}}
        ]};
    }
}
InjectorPulseWidthConfigs.push(ConfigInjectorPulseWidth_DeadTime);

class ConfigInjectorOutputs {
    static Name = "Injector Outputs";
    static Template = getFileContents("ConfigGui/Fuel_InjectorOutputs.html");

    constructor(){
        this.GUID = getGUID();
        this.Outputs[0] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 1", "No Measurement");
        this.Outputs[1] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 2", "No Measurement");
        this.Outputs[2] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 3", "No Measurement");
        this.Outputs[3] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 4", "No Measurement");
        this.Outputs[4] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 5", "No Measurement");
        this.Outputs[5] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 6", "No Measurement");
        this.Outputs[6] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 7", "No Measurement");
        this.Outputs[7] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 8", "No Measurement");
    }

    Outputs = [];

    GetObj() {
        var outputObj = [];
        for(var i = 0; i < this.Outputs.length; i++){
            outputObj[i] = this.Outputs[i].GetObj();
        };
        return {
            Name: GetClassProperty(this, "Name"),
            Outputs: outputObj
        };
    }

    SetObj(obj) {
        this.Detach();
        if(obj && obj.Outputs)
        {
            this.Outputs = [];
            for(var i = 0; i < obj.Outputs.length; i++){
                if(!this.Outputs[i])
                    this.Outputs[i] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector " + (i+1), "No Measurement")
                this.Outputs[i].SetObj(obj.Outputs[i])
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
        var thisClass = this;

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
                        { type: "UINT32", value: Increments.FuelParameters.find(a => a.Name === "Injector Pulse Width").Id },
                        { type: "UINT8", value: 0 }, //use variable
                        { type: "UINT32", value: Increments.FuelParameters.find(a => a.Name === "Injector End Position(ATDC)").Id },
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
    static Template = getFileContents("ConfigGui/TDCOutput.html");

    TDC = 0;
    
    GetObj() {
        var obj = super.GetObj();
        obj.TDC = this.TDC;
        return obj;
    }

    SetObj(obj) {
        super.SetObj(obj);
        this.Detach();
        if(obj)
            this.TDC = obj.TDC;

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }
    
    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-tdc", function(){
            thisClass.Detach();

            thisClass.TDC = $(this).val();
            
            thisClass.Attach();
        });

        if(this.Selection && !this.Selection.reference) 
            this.Selection.value.Attach();

        super.Attach();
    }

    GetHtml() {
        var template = super.GetHtml();
        
        template = template.replace(/[$]tdc[$]/g, this.TDC);

        return template;
    }
}