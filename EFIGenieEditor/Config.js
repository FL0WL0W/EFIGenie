var Increments = {};

function ResetIncrements()
{
    Increments = {};
}

var configEngineTemplate;
class ConfigEngine {
    constructor(){
        this.GUID = getGUID();
    }

    Inputs = new ConfigInputs();
    Fuel = new ConfigFuel();
    Ignition = new ConfigIgnition();

    IATSensorName = "";
    TPSSensorName = "";
    MAPSensorName = "";
    MAFSensorName = "";
    EthanolSensorName = "";
    ECTSensorName = "";
    CrankSensorName = "";
    CamSensorName = "";
    
    GetObj() {
        return { 
            Inputs: this.Inputs.GetObj(),
            Fuel: this.Fuel.GetObj(),
            Ignition: this.Ignition.GetObj()
        };
    }

    SetObj(obj) {
        this.Detach();
        this.Inputs = new ConfigInputs();
        this.Fuel = new ConfigFuel();
        this.Ignition = new ConfigIgnition();

        this.Inputs.SetObj(obj.Inputs);
        this.Fuel.SetObj(obj.Fuel);
        this.Ignition.SetObj(obj.Ignition);

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        ResetIncrements();//this is top level object so reset increments. this is not elegant
        this.Inputs.Detach();
        this.Fuel.Detach();
        this.Ignition.Detach();

        $(document).off("click."+this.GUID);
    }

    Attach() {
        var thisClass = this;
        this.SetIncrements();//this is top level object so set increments. this is not elegant
        this.Inputs.Attach();
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
        if(!configEngineTemplate)
            configEngineTemplate = getFileContents("ConfigGui/Engine.html");
        var template = configEngineTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);

        template = template.replace(/[$]inputs[$]/g, this.Inputs.GetHtml());
        template = template.replace(/[$]inputsstyle[$]/g, "");
        template = template.replace(/[$]inputstabclassses[$]/g, " active");
        
        template = template.replace(/[$]fuel[$]/g, this.Fuel.GetHtml());
        template = template.replace(/[$]fuelstyle[$]/g, " style=\"display: none;\"");
        template = template.replace(/[$]fueltabclassses[$]/g, "");
        
        template = template.replace(/[$]enginestyle[$]/g, " style=\"display: none;\"");
        template = template.replace(/[$]enginetabclassses[$]/g, "");
        
        template = template.replace(/[$]ignition[$]/g, this.Ignition.GetHtml());
        template = template.replace(/[$]ignitionstyle[$]/g, " style=\"display: none;\"");
        template = template.replace(/[$]ignitiontabclassses[$]/g, "");

        return template;
    }

    SetIncrements() {
        this.Inputs.SetIncrements();
        //this.Fuel.SetIncrements();
        //this.Ignition.SetIncrements();
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(this.Inputs.GetArrayBuffer())

        return arrayBuffer;
    }
}

var configFuelTemplate;
class ConfigFuel {
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
        if(!configFuelTemplate)
            configFuelTemplate = getFileContents("ConfigGui/Fuel.html");
        var template = configFuelTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

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