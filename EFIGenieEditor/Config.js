function ResetIncrements()
{
    OperationIncrement = 0;
    InputRawIncrement = 0;
    InputTranslationIncrement = 0;
}

var configEngineTemplate;
class ConfigEngine {
    constructor(){
        this.GUID = getGUID();
    }

    Inputs = new ConfigInputs();
    Fuel = new ConfigFuel();
    Ignition = new ConfigIgnition();

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
        this.Inputs.Detach();
        this.Fuel.Detach();
        this.Ignition.Detach();

        $(document).off("click."+this.GUID);
    }

    Attach() {
        var thisClass = this;
        this.Inputs.Attach();
        this.Fuel.Attach();
        this.Ignition.Attach();

        $(document).on("click."+this.GUID, "#" + this.GUID + "-inputstab", function(){
            $("#" + thisClass.GUID + "-inputs").show();
            $("#" + thisClass.GUID + "-inputstab").addClass("active");
            $("#" + thisClass.GUID + "-fuel").hide();
            $("#" + thisClass.GUID + "-fueltab").removeClass("active");
            $("#" + thisClass.GUID + "-ignition").hide();
            $("#" + thisClass.GUID + "-ignitiontab").removeClass("active");
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-fueltab", function(){
            $("#" + thisClass.GUID + "-inputs").hide();
            $("#" + thisClass.GUID + "-inputstab").removeClass("active");
            $("#" + thisClass.GUID + "-fuel").show();
            $("#" + thisClass.GUID + "-fueltab").addClass("active");
            $("#" + thisClass.GUID + "-ignition").hide();
            $("#" + thisClass.GUID + "-ignitiontab").removeClass("active");
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-ignitiontab", function(){
            $("#" + thisClass.GUID + "-inputs").hide();
            $("#" + thisClass.GUID + "-inputstab").removeClass("active");
            $("#" + thisClass.GUID + "-fuel").hide();
            $("#" + thisClass.GUID + "-fueltab").removeClass("active");
            $("#" + thisClass.GUID + "-ignition").show();
            $("#" + thisClass.GUID + "-ignitiontab").addClass("active");
        });
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
        
        template = template.replace(/[$]ignition[$]/g, this.Ignition.GetHtml());
        template = template.replace(/[$]ignitionstyle[$]/g, " style=\"display: none;\"");
        template = template.replace(/[$]ignitiontabclassses[$]/g, "");

        return template;
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
        this.Inputs.Detach();
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
        this.Inputs.Detach();
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