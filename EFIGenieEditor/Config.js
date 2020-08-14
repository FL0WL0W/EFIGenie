var EngineChannel = 4;
var FuelChannel = 5;
var Increments = {};
var AFRConfigs = [];
AFRConfigs.push(ConfigOperation_StaticScalar);
AFRConfigs.push(ConfigOperation_LookupTable);
AFRConfigs.push(ConfigOperation_2AxisTable);
var AdvanceConfigs = [];
AdvanceConfigs.push(ConfigOperation_StaticScalar);
AdvanceConfigs.push(ConfigOperation_LookupTable);
AdvanceConfigs.push(ConfigOperation_2AxisTable);
var CylinderAirmassConfigs = [];
CylinderAirmassConfigs.push(ConfigOperation_StaticScalar);
var CylinderAirTemperatureConfigs = [];
CylinderAirTemperatureConfigs.push(ConfigOperation_StaticScalar);
var ManifoldAbsolutePressureConfigs = [];
ManifoldAbsolutePressureConfigs.push(ConfigOperation_StaticScalar);
var VolumetricEfficiencyConfigs = [];
VolumetricEfficiencyConfigs.push(ConfigOperation_StaticScalar);
VolumetricEfficiencyConfigs.push(ConfigOperation_LookupTable);
VolumetricEfficiencyConfigs.push(ConfigOperation_2AxisTable);

function GetSelections(selection, measurement, configs) {
    var selections = "";
    var configSelected = false;
    if(configs) {
        for(var i = 0; i < configs.length; i++) {
            var selected = false;
            if(selection && !selection.reference && selection.value instanceof configs[i]){
                selected = true;
                configSelected = true;
            }

            selections += "<option value=\"" + i + "\"" + (selected? " selected" : "") + ">" + configs[i].Name + "</option>"
        }
        if(selections) 
            selections = "<optgroup label=\"Calculations\">" + selections + "</optgroup>";
    }
    
    for(var property in Increments){
        if(!Array.isArray(Increments[property]))
            continue;
        if(property === "PostEvent")
            continue;

        var arr = Increments[property];
        
        var arrSelections = "";

        for(var i = 0; i < arr.length; i++) {
            if(!measurement || arr[i].Measurement === measurement) {
                var selected = false;
                if(selection && selection.reference === property && selection.value === arr[i].Name){
                    selected = true;
                    configSelected = true;
                }
    
                arrSelections += "<option reference=\"" + property + "\" value=\"" + arr[i].Name + "\"" + (selected? " selected" : "") + ">" + arr[i].Name + (!measurement? " [" + GetUnitDisplay(arr[i].Measurement) + "]" : "") + "</option>"
            }
        }
        if(arrSelections) 
            arrSelections = "<optgroup label=\"" + property + "\">" + arrSelections + "</optgroup>";

        selections += arrSelections;
    }

    selections = "<option value=\"-1\" disabled" + (configSelected? "" : " selected") + ">Select</option>" + selections;

    return selections;
}

function ResetIncrements()
{
    Increments = {};
}

var configTopTemplate;
class ConfigTop {
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

        this.Inputs.SetObj(obj.Inputs);
        this.Engine.SetObj(obj.Engine);
        this.Fuel.SetObj(obj.Fuel);
        this.Ignition.SetObj(obj.Ignition);

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
        if(!configTopTemplate)
            configTopTemplate = getFileContents("ConfigGui/Top.html");
        var template = configTopTemplate;

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
        //this.Ignition.SetIncrements();
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(this.Inputs.GetArrayBuffer());
        arrayBuffer = arrayBuffer.concatArray(this.Engine.GetArrayBuffer());
        arrayBuffer = arrayBuffer.concatArray(this.Fuel.GetArrayBuffer());
        arrayBuffer = arrayBuffer.concatArray(this.Ignition.GetArrayBuffer());

        return arrayBuffer;
    }
}

var configFuelTemplate;
class ConfigFuel {
    constructor(){
        this.GUID = getGUID();
    }

    AFR = new ConfigAFR();

    GetObj() {
        return {
            AFR: this.AFR.GetObj()
        };
    }

    SetObj(obj) {
        this.Detach();
        this.AFR = new ConfigAFR();

        this.AFR.SetObj(obj.AFR);

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        this.AFR.Detach();
    }

    Attach() {
        var thisClass = this;
        this.AFR.Attach();
    }

    GetHtml() {
        if(!configFuelTemplate)
            configFuelTemplate = getFileContents("ConfigGui/Fuel.html");
        var template = configFuelTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]afr[$]/g, this.AFR.GetHtml());

        return template;
    }

    SetIncrements() {
        this.AFR.SetIncrements();
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(this.AFR.GetArrayBuffer())

        return arrayBuffer;
    }
}

var configAFRTemplate;
class ConfigAFR {
    constructor(){
        this.GUID = getGUID();
    }

    Config = undefined;

    GetObj() {
        return { 
            Name: this.Name,
            Config: this.Config? this.Config.GetObj() : undefined
        };
    }

    SetObj(obj) {
        this.Detach();
        this.Name = obj.Name;
        this.Config = undefined;
        if(obj.Config){
            for(var i = 0; i < AFRConfigs.length; i++)
            {
                if(AFRConfigs[i].Name === obj.Config.Name) {
                    this.Config = new AFRConfigs[i]();
                    this.Config.ValueLabel = "AFR";
                    this.Config.ValueMeasurement = "Ratio";
                    this.Config.SetObj(obj.Config);
                    break;
                }
            }
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
        if(this.Config) 
            this.Config.Detach();
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-selection", function(){
            thisClass.Detach();

            var val = $(this).val();
            if(val === "-1") {
                thisClass.Config = undefined;
            } else {
                thisClass.Config = new AFRConfigs[val]();
                thisClass.Config.ValueLabel = "AFR";
                thisClass.Config.ValueMeasurement = "Ratio";
            }
            
            if(thisClass.Config) {
                $("#" + thisClass.GUID + "-config").html(thisClass.Config.GetHtml());
            } else {
                $("#" + thisClass.GUID + "-config").html("");
            }
            
            thisClass.Attach();
        });

        if(this.Config) 
            this.Config.Attach();
    }

    GetHtml() {
        if(!configAFRTemplate)
        configAFRTemplate = getFileContents("ConfigGui/Fuel_AFR.html");
        var template = configAFRTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        
        var selections;
        var configSelected = false;
        for(var i = 0; i < AFRConfigs.length; i++)
        {
            var selected = false;
            if(this.Config && this.Config instanceof AFRConfigs[i]){
                selected = true;
                configSelected = true;
            }

            selections += "<option value=\"" + i + "\"" + (selected? " selected" : "") + ">" + AFRConfigs[i].Name + "</option>"
        }
        if(!configSelected)
            this.Config = undefined;
        selections = "<option value=\"-1\" disabled" + (selected? "" : " selected") + ">Select</option>" + selections;
        template = template.replace(/[$]selections[$]/g, selections);
        
        if(this.Config) {
            template = template.replace(/[$]config[$]/g, this.Config.GetHtml());
        } else {
            template = template.replace(/[$]config[$]/g, "");
        }
        template = template.replace(/[$]value[$]/g, "");//this is for interactivity later
        template = template.replace(/[$]measurement[$]/g, GetMeasurementDisplay("Ratio"));

        return template;
    }

    Id = -1;
    SetIncrements() {
        this.Id = -1;

        if(!this.Config) 
            return;
        
        this.Channel = FuelChannel;
        this.Id = 0;
        if(Increments.FuelIncrement === undefined)
            Increments.FuelIncrement = 0;
        else
            this.Id = ++Increments.FuelIncrement;

        Increments.AFR = { 
            Name: this.Name, 
            Id: this.InputRawId
        }

        if(this.Config.SetIncrements)
            this.Config.SetIncrements();
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();
        if(!this.Config) 
            return arrayBuffer;

        if(Increments.FuelIncrement === undefined)
            throw "Set Increments First";
        if(this.Id === -1)
            throw "Set Increments First";

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ 6003 ]).buffer); //Execute in main loop
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ this.Channel << 1 | 1 ]).buffer); //variable channel | immediate
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ this.Id ]).buffer); //AFRID
        arrayBuffer = arrayBuffer.concatArray(this.Config.GetArrayBuffer());
        
        return arrayBuffer;
    }
}

var configIgnitionTemplate;
class ConfigIgnition {
    constructor(){
        this.GUID = getGUID();
    }

    GetObj() {
        return {
        };
    }

    SetObj(obj) {
        this.Detach();

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
    }

    Attach() {
        var thisClass = this;
    }

    GetHtml() {
        if(!configIgnitionTemplate)
            configIgnitionTemplate = getFileContents("ConfigGui/Ignition.html");
        var template = configIgnitionTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        return arrayBuffer;
    }
}

var configEngineTemplate;
class ConfigEngine {
    constructor(){
        this.GUID = getGUID();
    }

    CylinderAirmassSelection = undefined;
    CylinderAirTemperatureSelection = undefined;
    ManifoldAbsolutePressureSelection = undefined;
    VolumetricEfficiencySelection = undefined;

    GetObj() {
        var gs = function(s) { return s? { reference: s.reference, value: s.reference? s.value : s.value.GetObj() } : undefined; };
        return { 
            CylinderAirmassSelection: gs(this.CylinderAirmassSelection),
            CylinderAirTemperatureSelection : gs(this.CylinderAirTemperatureSelection),
            ManifoldAbsolutePressureSelection : gs(this.ManifoldAbsolutePressureSelection),
            VolumetricEfficiencySelection: gs(this.VolumetricEfficiencySelection)
        };
    }

    SetObj(obj) {
        this.Detach();
        this.CylinderAirmassSelection = obj.CylinderAirmassSelection;
        if(this.CylinderAirmassSelection && !this.CylinderAirmassSelection.reference)
        {
            for(var i = 0; i < CylinderAirmassConfigs.length; i++)
            {
                if(CylinderAirmassConfigs[i].Name === this.CylinderAirmassSelection.value.Name) {
                    var c = this.CylinderAirmassSelection.value;
                    this.CylinderAirmassSelection.value = new CylinderAirmassConfigs[i]();
                    this.CylinderAirmassSelection.value.ValueLabel = "Cylinder Air Mass";
                    this.CylinderAirmassSelection.value.ValueMeasurement = "Mass";
                    this.CylinderAirmassSelection.value.SetObj(c);
                    break;
                }
            }
        }
        this.CylinderAirTemperatureSelection = obj.CylinderAirTemperatureSelection;
        if(this.CylinderAirTemperatureSelection && !this.CylinderAirTemperatureSelection.reference)
        {
            for(var i = 0; i < CylinderAirTemperatureConfigs.length; i++)
            {
                if(CylinderAirTemperatureConfigs[i].Name === this.CylinderAirTemperatureSelection.value.Name) {
                    var c = this.CylinderAirTemperatureSelection.value;
                    this.CylinderAirTemperatureSelection.value = new CylinderAirTemperatureConfigs[i]();
                    this.CylinderAirTemperatureSelection.value.ValueLabel = "Cylinder Air Temperature";
                    this.CylinderAirTemperatureSelection.value.ValueMeasurement = "Temperature";
                    this.CylinderAirTemperatureSelection.value.SetObj(c);
                    break;
                }
            }
        }
        this.ManifoldAbsolutePressureSelection = obj.ManifoldAbsolutePressureSelection;
        if(this.ManifoldAbsolutePressureSelection && !this.ManifoldAbsolutePressureSelection.reference)
        {
            for(var i = 0; i < ManifoldAbsolutePressureConfigs.length; i++)
            {
                if(ManifoldAbsolutePressureConfigs[i].Name === this.ManifoldAbsolutePressureSelection.value.Name) {
                    var c = this.ManifoldAbsolutePressureSelection.value;
                    this.ManifoldAbsolutePressureSelection.value = new ManifoldAbsolutePressureConfigs[i]();
                    this.ManifoldAbsolutePressureSelection.value.ValueLabel = "Manifold Absolute Pressure";
                    this.ManifoldAbsolutePressureSelection.value.ValueMeasurement = "Pressure";
                    this.ManifoldAbsolutePressureSelection.value.SetObj(c);
                    break;
                }
            }
        }
        this.VolumetricEfficiencySelection = obj.VolumetricEfficiencySelection;
        if(this.VolumetricEfficiencySelection && !this.VolumetricEfficiencySelection.reference)
        {
            for(var i = 0; i < VolumetricEfficiencyConfigs.length; i++)
            {
                if(VolumetricEfficiencyConfigs[i].Name === this.VolumetricEfficiencySelection.value.Name) {
                    var c = this.VolumetricEfficiencySelection.value;
                    this.VolumetricEfficiencySelection.value = new VolumetricEfficiencyConfigs[i]();
                    this.VolumetricEfficiencySelection.value.ValueLabel = "Volumetric Efficiency";
                    this.VolumetricEfficiencySelection.value.ValueMeasurement = "Percentage";
                    this.VolumetricEfficiencySelection.value.SetObj(c);
                    break;
                }
            }
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);            
        if(this.CylinderAirmassSelection && !this.CylinderAirmassSelection.reference) 
            this.CylinderAirmassSelection.value.Detach();
        if(this.CylinderAirTemperatureSelection && !this.CylinderAirTemperatureSelection.reference) 
            this.CylinderAirTemperatureSelection.value.Detach();
        if(this.ManifoldAbsolutePressureSelection && !this.ManifoldAbsolutePressureSelection.reference) 
            this.ManifoldAbsolutePressureSelection.value.Detach();
        if(this.VolumetricEfficiencySelection && !this.VolumetricEfficiencySelection.reference) 
            this.VolumetricEfficiencySelection.value.Detach();
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-cylinderairmassselection", function(){
            thisClass.Detach();

            var val = $(this).val();
            if($('option:selected', this).attr('reference') === undefined)
            {
                if(val === "-1")
                    thisClass.CylinderAirmassSelection = undefined;
                else {
                    thisClass.CylinderAirmassSelection = {value: new CylinderAirmassConfigs[val]()}
                    thisClass.CylinderAirmassSelection.value.ValueLabel = "Cylinder Air Mass";
                    thisClass.CylinderAirmassSelection.value.ValueMeasurement = "Mass";
                }
            } else {
                thisClass.CylinderAirmassSelection = {reference: $('option:selected', this).attr('reference'), value: val};
            }
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-cylinderairtemperatureselection", function(){
            thisClass.Detach();

            var val = $(this).val();
            if($('option:selected', this).attr('reference') === undefined)
            {
                if(val === "-1")
                    thisClass.CylinderAirTemperatureSelection = undefined;
                else {
                    thisClass.CylinderAirTemperatureSelection = {value: new CylinderAirTemperatureConfigs[val]()}
                    thisClass.CylinderAirTemperatureSelection.value.ValueLabel = "Cylinder Air Temperature";
                    thisClass.CylinderAirTemperatureSelection.value.ValueMeasurement = "Temperature";
                }
            } else {
                thisClass.CylinderAirTemperatureSelection = {reference: $('option:selected', this).attr('reference'), value: val};
            }
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-manifoldabsolutepressureselection", function(){
            thisClass.Detach();
            
            var val = $(this).val();
            if($('option:selected', this).attr('reference') === undefined)
            {
                if(val === "-1")
                    thisClass.ManifoldAbsolutePressureSelection = undefined;
                else {
                    thisClass.ManifoldAbsolutePressureSelection = {value: new ManifoldAbsolutePressureConfigs[val]()}
                    thisClass.ManifoldAbsolutePressureSelection.value.ValueLabel = "Manifold Absolue Pressure";
                    thisClass.ManifoldAbsolutePressureSelection.value.ValueMeasurement = "Pressure";
                }
            } else {
                thisClass.ManifoldAbsolutePressureSelection = {reference: $('option:selected', this).attr('reference'), value: val};
            }
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-volumetricefficiencyelection", function(){
            thisClass.Detach();
            
            var val = $(this).val();
            if($('option:selected', this).attr('reference') === undefined)
            {
                if(val === "-1")
                    thisClass.VolumetricEfficiencySelection = undefined;
                else {
                    thisClass.VolumetricEfficiencySelection = {value: new VolumetricEfficiencyConfigs[val]()}
                    thisClass.VolumetricEfficiencySelection.value.ValueLabel = "Volumetric Efficiency";
                    thisClass.VolumetricEfficiencySelection.value.ValueMeasurement = "Percentage";
                }
            } else {
                thisClass.VolumetricEfficiencySelection = {reference: $('option:selected', this).attr('reference'), value: val};
            }
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
            thisClass.Attach();
        });

        if(this.CylinderAirmassSelection && !this.CylinderAirmassSelection.reference) 
            this.CylinderAirmassSelection.value.Attach();
        if(this.CylinderAirTemperatureSelection && !this.CylinderAirTemperatureSelection.reference) 
            this.CylinderAirTemperatureSelection.value.Attach();
        if(this.ManifoldAbsolutePressureSelection && !this.ManifoldAbsolutePressureSelection.reference) 
            this.ManifoldAbsolutePressureSelection.value.Attach();
        if(this.VolumetricEfficiencySelection && !this.VolumetricEfficiencySelection.reference) 
            this.VolumetricEfficiencySelection.value.Attach();
    }

    GetHtml() {
        if(!configEngineTemplate)
        configEngineTemplate = getFileContents("ConfigGui/Engine.html");
        var template = configEngineTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        
        var requirements = [];

        template = template.replace(/[$]cylinderairmassselections[$]/g, GetSelections(this.CylinderAirmassSelection, "Mass", CylinderAirmassConfigs));
        if(this.CylinderAirmassSelection && !this.CylinderAirmassSelection.reference) {
            template = template.replace(/[$]cylinderairmassconfig[$]/g, this.CylinderAirmassSelection.value.GetHtml());
            requirements = GetClassProperty(this.CylinderAirmassSelection.value, "Requirements");
        } else {
            template = template.replace(/[$]cylinderairmassconfig[$]/g, "");
        }
        template = template.replace(/[$]cylinderairmassvalue[$]/g, "");//this is for interactivity later
        template = template.replace(/[$]cylinderairmassmeasurement[$]/g, GetMeasurementDisplay("Mass"));
        
        template = template.replace(/[$]cylinderairtemperatureselections[$]/g, GetSelections(this.CylinderAirTemperatureSelection, "Temperature", CylinderAirTemperatureConfigs));
        template = template.replace(/[$]cylinderairtemperaturedivstyle[$]/g, 
            requirements && requirements.indexOf("Cylinder Air Temperature") > -1? "" : "style=\"display:none;\"");
        if(this.CylinderAirTemperatureSelection && !this.CylinderAirTemperatureSelection.reference) {
            template = template.replace(/[$]cylinderairtemperatureconfig[$]/g, this.CylinderAirTemperatureSelection.value.GetHtml());
        } else {
            template = template.replace(/[$]cylinderairtemperatureconfig[$]/g, "");
        }
        template = template.replace(/[$]cylinderairtemperaturevalue[$]/g, "");//this is for interactivity later
        template = template.replace(/[$]cylinderairtemperaturemeasurement[$]/g, GetMeasurementDisplay("Temperature"));

        template = template.replace(/[$]manifoldabsolutepressureselections[$]/g, GetSelections(this.ManifoldAbsolutePressureSelection, "Pressure", ManifoldAbsolutePressureConfigs));
        template = template.replace(/[$]manifoldabsolutepressuredivstyle[$]/g, 
            requirements && requirements.indexOf("Manifold Absolute Pressure") > -1? "" : "style=\"display:none;\"");
        if(this.ManifoldAbsolutePressureSelection && !this.ManifoldAbsolutePressureSelection.reference) {
            template = template.replace(/[$]manifoldabsolutepressureconfig[$]/g, this.ManifoldAbsolutePressureSelection.value.GetHtml());
        } else {
            template = template.replace(/[$]manifoldabsolutepressureconfig[$]/g, "");
        }
        template = template.replace(/[$]manifoldabsolutepressurevalue[$]/g, "");//this is for interactivity later
        template = template.replace(/[$]manifoldabsolutepressuremeasurement[$]/g, GetMeasurementDisplay("Pressure"));
        
        template = template.replace(/[$]volumetricefficiencyelections[$]/g, GetSelections(this.VolumetricEfficiencySelection, "Percentage", VolumetricEfficiencyConfigs));
        template = template.replace(/[$]volumetricefficiencydivstyle[$]/g, 
            requirements && requirements.indexOf("Volumetric Efficiency") > -1? "" : "style=\"display:none;\"");
        if(this.VolumetricEfficiencySelection && !this.VolumetricEfficiencySelection.reference) {
            template = template.replace(/[$]volumetricefficiencyconfig[$]/g, this.VolumetricEfficiencySelection.value.GetHtml());
        } else {
            template = template.replace(/[$]volumetricefficiencyconfig[$]/g, "");
        }
        template = template.replace(/[$]volumetricefficiencyvalue[$]/g, "");//this is for interactivity later
        template = template.replace(/[$]volumetricefficiencymeasurement[$]/g, GetMeasurementDisplay("Percentage"));


        return template;
    }

    GetCellByName(array, name) {
        if(!array)
            return undefined;
        for(var i = 0; i < array.length; i++) {
            if(name && name === array[i].Name)
                return array[i];
        }
        return undefined;
    }

    UpdateSelections() {
        $("#" + this.GUID + "-cylinderairmassselection").html(GetSelections(this.CylinderAirmassSelection, "Mass", CylinderAirmassConfigs));
        $("#" + this.GUID + "-cylinderairtemperatureselection").html(GetSelections(this.CylinderAirTemperatureSelection, "Temperature", CylinderAirTemperatureConfigs));
        $("#" + this.GUID + "-manifoldabsolutepressureselection").html(GetSelections(this.ManifoldAbsolutePressureSelection, "Pressure", ManifoldAbsolutePressureConfigs));
        $("#" + this.GUID + "-volumetricefficiencyelection").html(GetSelections(this.VolumetricEfficiencySelection, "Percentage", VolumetricEfficiencyConfigs));
    }

    CylinderAirmassId = -1;
    CylinderAirTemperatureId = -1;
    ManifoldAbsolutePressureId = -1;
    VolumetricEfficiencyId = -1;
    SetIncrements() {
        var thisClass = this;
        if(!Increments.PostEvent)
            Increments.PostEvent = [];
        Increments.PostEvent.push(function() { thisClass.UpdateSelections(); });

        this.CylinderAirmassId = -1;
        this.CylinderAirTemperatureId = -1;
        this.ManifoldAbsolutePressureId = -1;
        this.VolumetricEfficiencyId = -1;

        if(Increments.EngineParameters === undefined)
        Increments.EngineParameters = [];

        var requirements = [];

        if(this.CylinderAirmassSelection && !this.CylinderAirmassSelection.reference) {
            requirements = GetClassProperty(this.CylinderAirmassSelection.value, "Requirements");
        }

        if(requirements && requirements.indexOf("Manifold Absolute Pressure") > -1 && this.ManifoldAbsolutePressureSelection) {
            if(!this.ManifoldAbsolutePressureSelection.reference) {
                this.ManifoldAbsolutePressureId = 0;
                if(Increments.EngineIncrement === undefined)
                    Increments.EngineIncrement = 0;
                else
                    this.ManifoldAbsolutePressureId = ++Increments.EngineIncrement;

                if(this.ManifoldAbsolutePressureSelection.value.SetIncrements)
                    this.ManifoldAbsolutePressureSelection.value.SetIncrements();

                Increments.EngineParameters.push({ 
                    Name: "Manifold Absolute Pressure", 
                    Channel: EngineChannel,
                    Id: this.ManifoldAbsolutePressureId,
                    Type: "float",
                    Measurement: "Pressure"
                });
            } else {
                var cell = this.GetCellByName(Increments[this.ManifoldAbsolutePressureSelection.reference], this.ManifoldAbsolutePressureSelection.value);
                if(cell) {
                    Increments.EngineParameters.push({ 
                        Name: "Manifold Absolute Pressure", 
                        Channel: cell.Channel,
                        Id: cell.Id,
                        Type: "float",
                        Measurement: "Pressure"
                    });
                }
            } 
        }

        if(requirements && requirements.indexOf("Cylinder Air Temperature") > -1 && this.CylinderAirTemperatureSelection) {
            if(!this.CylinderAirTemperatureSelection.reference) {
                this.CylinderAirTemperatureId = 0;
                if(Increments.EngineIncrement === undefined)
                    Increments.EngineIncrement = 0;
                else
                    this.CylinderAirTemperatureId = ++Increments.EngineIncrement;

                if(this.CylinderAirTemperatureSelection.value.SetIncrements)
                this.CylinderAirTemperatureSelection.value.SetIncrements();
                    
                Increments.EngineParameters.push({ 
                    Name: "Cylinder Air Temperature", 
                    Channel: EngineChannel,
                    Id: this.CylinderAirTemperatureId,
                    Type: "float",
                    Measurement: "Temperature"
                });
            } else {
                var cell = this.GetCellByName(Increments[this.CylinderAirTemperatureSelection.reference], this.CylinderAirTemperatureSelection.value);
                if(cell) {
                    Increments.EngineParameters.push({ 
                        Name: "Cylinder Air Temperature", 
                        Channel: cell.Channel,
                        Id: cell.Id,
                        Type: "float",
                        Measurement: "Temperature"
                    });
                }
            }
        }

        if(requirements && requirements.indexOf("Volumetric Efficiency") > -1 && this.VolumetricEfficiencySelection) {
            if(!this.VolumetricEfficiencySelection.reference) {
                this.VolumetricEfficiencyId = 0;
                if(Increments.EngineIncrement === undefined)
                    Increments.EngineIncrement = 0;
                else
                    this.VolumetricEfficiencyId = ++Increments.EngineIncrement;

                if(this.VolumetricEfficiencySelection.value.SetIncrements)
                    this.VolumetricEfficiencySelection.value.SetIncrements();
                    
                Increments.EngineParameters.push({ 
                    Name: "Volumetric Efficiency", 
                    Channel: EngineChannel,
                    Id: this.VolumetricEfficiencyId,
                    Type: "float",
                    Measurement: "Percentage"
                });
            } else {
                var cell = this.GetCellByName(Increments[this.VolumetricEfficiencySelection.reference], this.VolumetricEfficiencySelection.value);
                if(cell) {
                    Increments.EngineParameters.push({ 
                        Name: "Volumetric Efficiency", 
                        Channel: cell.Channel,
                        Id: cell.Id,
                        Type: "float",
                        Measurement: "Percentage"
                    });
                }
            }
        }
        
        if(this.CylinderAirmassSelection) {
            if(!this.CylinderAirmassSelection.reference) {
                this.CylinderAirmassId = 0;
                if(Increments.EngineIncrement === undefined)
                    Increments.EngineIncrement = 0;
                else
                    this.CylinderAirmassId = ++Increments.EngineIncrement;

                if(this.CylinderAirmassSelection.value.SetIncrements)
                    this.CylinderAirmassSelection.value.SetIncrements();

                Increments.EngineParameters.push({ 
                    Name: "Cylinder Air Mass", 
                    Channel: EngineChannel,
                    Id: this.CylinderAirmassId,
                    Type: "float",
                    Measurement: "Mass"
                });
            } else {
                var cell = this.GetCellByName(Increments[this.CylinderAirmassSelection.reference], this.CylinderAirmassSelection.value);
                if(cell) {
                    Increments.EngineParameters.push({ 
                        Name: "Cylinder Air Mass", 
                        Channel: cell.Channel,
                        Id: cell.Id,
                        Type: "float",
                        Measurement: "Mass"
                    });
                }
            }
        }
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        var requirements = [];
        if(this.CylinderAirmassSelection && !this.CylinderAirmassSelection.reference) {
            requirements = GetClassProperty(this.CylinderAirmassSelection.value, "Requirements");
        }

        if(requirements && requirements.indexOf("Manifold Absolute Pressure") > -1) {
            if(this.ManifoldAbsolutePressureSelection && !this.ManifoldAbsolutePressureSelection.reference) {
                if(Increments.EngineIncrement === undefined)
                    throw "Set Increments First";
                if(this.ManifoldAbsolutePressureId === -1)
                    throw "Set Increments First";
                    
                arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ 6003 ]).buffer); //Execute in main loop
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ EngineChannel << 1 | 1 ]).buffer); //variable channel | immediate
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ this.ManifoldAbsolutePressureId ]).buffer); //ManifoldAbsolutePressureId
                arrayBuffer = arrayBuffer.concatArray(this.ManifoldAbsolutePressureSelection.value.GetArrayBuffer());
            }
        }

        if(requirements && requirements.indexOf("Cylinder Air Temperature") > -1) {
            if(this.CylinderAirTemperatureSelection && !this.CylinderAirTemperatureSelection.reference) {
                if(Increments.EngineIncrement === undefined)
                    throw "Set Increments First";
                if(this.CylinderAirTemperatureId === -1)
                    throw "Set Increments First";
                    
                arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ 6003 ]).buffer); //Execute in main loop
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ EngineChannel << 1 | 1 ]).buffer); //variable channel | immediate
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ this.CylinderAirTemperatureId ]).buffer); //VolumetricEfficiencyId
                arrayBuffer = arrayBuffer.concatArray(this.CylinderAirTemperatureSelection.value.GetArrayBuffer());
            }
        }

        if(requirements && requirements.indexOf("Volumetric Efficiency") > -1) {
            if(this.VolumetricEfficiencySelection && !this.VolumetricEfficiencySelection.reference) {
                if(Increments.EngineIncrement === undefined)
                    throw "Set Increments First";
                if(this.VolumetricEfficiencyId === -1)
                    throw "Set Increments First";
                    
                arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ 6003 ]).buffer); //Execute in main loop
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ EngineChannel << 1 | 1 ]).buffer); //variable channel | immediate
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ this.VolumetricEfficiencyId ]).buffer); //VolumetricEfficiencyId
                arrayBuffer = arrayBuffer.concatArray(this.VolumetricEfficiencySelection.value.GetArrayBuffer());
            }
        }
        
        if(this.VolumetricEfficiencySelection && !this.VolumetricEfficiencySelection.reference) {
            if(Increments.EngineIncrement === undefined)
                throw "Set Increments First";
            if(this.CylinderAirmassId === -1)
                throw "Set Increments First";
                
            arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ 6003 ]).buffer); //Execute in main loop
            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ EngineChannel << 1 | 1 ]).buffer); //variable channel | immediate
            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ this.CylinderAirmassId ]).buffer); //CylinderAirmassID
            arrayBuffer = arrayBuffer.concatArray(this.VolumetricEfficiencySelection.value.GetArrayBuffer());
        }
        
        return arrayBuffer;
    }
}

var configCylinderAirmass_SpeedDensityTemplate;
class ConfigCylinderAirmass_SpeedDensity {
    static Name = "Speed Density";
    static Measurement = "";
    static Requirements = ["Cylinder Air Temperature", "Manifold Absolute Pressure", "Volumetric Efficiency"];

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
        if(!configCylinderAirmass_SpeedDensityTemplate)
            configCylinderAirmass_SpeedDensityTemplate = getFileContents("ConfigGui/Engine_CylinderAirmass_SpeedDensity.html");
        var template = configCylinderAirmass_SpeedDensityTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]cylindervolume[$]/g, this.CylinderVolume);
        template = template.replace(/[$]cylindervolumemeasurement[$]/g, GetMeasurementDisplay(Measurements["Volume"]));
        return template;
    }

    GetArrayBuffer() {
        var thisClass = this;
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([2007]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([this.CylinderVolume]).buffer); //CylinderVolume
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments.EngineParameters.find(a => a.Name === "Cylinder Air Temperature").Channel ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments.EngineParameters.find(a => a.Name === "Cylinder Air Temperature").Id ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments.EngineParameters.find(a => a.Name === "Manifold Absolute Pressure").Channel ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments.EngineParameters.find(a => a.Name === "Manifold Absolute Pressure").Id ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments.EngineParameters.find(a => a.Name === "Volumetric Efficiency").Channel ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments.EngineParameters.find(a => a.Name === "Volumetric Efficiency").Id ]).buffer);
                
        return arrayBuffer;
    }
}
CylinderAirmassConfigs.push(ConfigCylinderAirmass_SpeedDensity);