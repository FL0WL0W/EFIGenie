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
    InjectorPrimeArray: 3,
    Position: 4,
    PositionPrediction: 5,
    RPM: 6,
    ScheduleIgnition: 7,
    ScheduleIgnitionArray: 8,
    ScheduleInjection: 9,
    ScheduleInjectionArray: 10
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
        var arrayBuffer = new ArrayBuffer();

        //operations
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ 0 ]).buffer); //signal last operation
        
        //inputs
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x09 ]).buffer); //immediate group
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ 2 ]).buffer); //number of operations
        arrayBuffer = arrayBuffer.concatArray(this.Inputs.GetArrayBufferPackage());
        arrayBuffer = arrayBuffer.concatArray(this.Engine.GetArrayBufferPackage());

        //preSync
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x09 ]).buffer); //immediate group
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ 0 ]).buffer); //number of operations

        //sync condition
        //static true for now
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x05 ]).buffer); //immediate return
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Static]).buffer); //static value
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([11]).buffer); //bool
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([true]).buffer); //value

        //main loop execute
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x09 ]).buffer); //immediate group
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ 2 ]).buffer); //number of operations
        arrayBuffer = arrayBuffer.concatArray(this.Fuel.GetArrayBufferPackage());
        arrayBuffer = arrayBuffer.concatArray(this.Ignition.GetArrayBufferPackage());

        return arrayBuffer;
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
        this.ConfigInjectorOutputs = new ConfigInjectorOutputs();
    }

    AFRConfigOrVariableSelection = undefined;
    InjectorPulseWidthConfigOrVariableSelection = undefined;
    ConfigInjectorOutputs = undefined

    GetObj() {
        return {
            AFRConfigOrVariableSelection: this.AFRConfigOrVariableSelection.GetObj(),
            InjectorPulseWidthConfigOrVariableSelection: this.InjectorPulseWidthConfigOrVariableSelection.GetObj(),
            ConfigInjectorOutputs: this.ConfigInjectorOutputs.GetObj()
        };
    }

    SetObj(obj) {
        this.Detach();

        if(obj) {
            this.AFRConfigOrVariableSelection.SetObj(!obj? undefined : obj.AFRConfigOrVariableSelection);
            this.InjectorPulseWidthConfigOrVariableSelection.SetObj(!obj? undefined : obj.InjectorPulseWidthConfigOrVariableSelection);
            this.ConfigInjectorOutputs.SetObj(!obj? undefined : obj.ConfigInjectorOutputs);
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        this.AFRConfigOrVariableSelection.Detach();
        this.InjectorPulseWidthConfigOrVariableSelection.Detach();
        this.ConfigInjectorOutputs.Detach();
    }

    Attach() {
        this.AFRConfigOrVariableSelection.Attach();
        this.InjectorPulseWidthConfigOrVariableSelection.Attach();
        this.ConfigInjectorOutputs.Attach();
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]afr[$]/g, this.AFRConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]injectorpulsewidth[$]/g, this.InjectorPulseWidthConfigOrVariableSelection.GetHtml());
        template = template.replace(/[$]injectoroutputs[$]/g, this.ConfigInjectorOutputs.GetHtml());
        
        return template;
    }

    InjectorGramsId = -1;
    SetIncrements() {
        this.AFRConfigOrVariableSelection.SetIncrements();

        this.InjectorGramsId = -1;
        if(Increments.FuelParameters === undefined)
            Increments.FuelParameters = [];

        this.InjectorGramsId = 0;
        if(Increments.VariableIncrement === undefined)
            Increments.VariableIncrement = 0;
        else
            this.InjectorGramsId = ++Increments.VariableIncrement;
        Increments.FuelParameters.push({ 
            Name: "Injector Grams", 
            Id: this.InjectorGramsId,
            Type: "float",
            Measurement: "Mass"
        });

        this.InjectorPulseWidthConfigOrVariableSelection.SetIncrements();
        this.ConfigInjectorOutputs.SetIncrements();
    }

    GetArrayBufferPackage() {
        var arrayBuffer = new ArrayBuffer();
        
        if(Increments.VariableIncrement === undefined)
        throw "Set Increments First";
        if(this.InjectorGramsId === -1)
            throw "Set Increments First";

        var numberOfOperations = 2;
        if(this.InjectorPulseWidthConfigOrVariableSelection.IsImmediateOperation())
            ++numberOfOperations;

        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x09 ]).buffer); //immediate group
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ numberOfOperations ]).buffer); //number of operations

        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x03 ]).buffer); //immediate store
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Math]).buffer); //Math factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 3 ]).buffer); //Divide operator
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ this.InjectorGramsId ]).buffer); //Injector Grams ID
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0 ]).buffer); //use variable
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ Increments.EngineParameters.find(a => a.Name === "Cylinder Air Mass").Id ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(this.AFRConfigOrVariableSelection.GetArrayBufferAsParameter(1));
        arrayBuffer = arrayBuffer.concatArray(this.AFRConfigOrVariableSelection.GetArrayBufferPackage(true));

        arrayBuffer = arrayBuffer.concatArray(this.InjectorPulseWidthConfigOrVariableSelection.GetArrayBufferPackage());

        arrayBuffer = arrayBuffer.concatArray(this.ConfigInjectorOutputs.GetArrayBufferPackage());

        return arrayBuffer;
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
    Outputs = [];

    GetObj() {
        var outputObj = [];
        for(var i = 0; i < this.Outputs.length; i++){
            outputObj[i] = this.Outputs[i].GetObj();
        };
        return {
            IgnitionAdvanceConfigOrVariableSelection: this.IgnitionAdvanceConfigOrVariableSelection.GetObj(),
            Outputs: outputObj
        };
    }

    SetObj(obj) {
        this.Detach();
        this.IgnitionAdvanceConfigOrVariableSelection.SetObj(!obj? undefined : obj.IgnitionAdvanceConfigOrVariableSelection);
        if(obj)
        {
            for(var i = 0; i < obj.Outputs.length; i++){
                if(!this.Outputs[i])
                    this.Outputs[i] = new ConfigTDCOutput(BooleanOutputConfigs, "Ignition " + (i+1), "No Measurement")
                this.Outputs[i].SetObj(obj.Outputs[i])
            }
            for(var i = obj.Outputs.length; i < this.Outputs.length; i++){
                this.Outputs[i] = undefined;
            }
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        this.IgnitionAdvanceConfigOrVariableSelection.Detach();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].Detach();
        };
    }

    Attach() {
        this.IgnitionAdvanceConfigOrVariableSelection.Attach();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].Attach();
        };

    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);

        template = template.replace(/[$]ignitionadvance[$]/g, this.IgnitionAdvanceConfigOrVariableSelection.GetHtml());

        var outputsHTML = "";
        
        for(var i = 0; i < this.Outputs.length; i++){
            outputsHTML += this.Outputs[i].GetHtml();
        };
        
        template = template.replace(/[$]ignitionoutputs[$]/g, outputsHTML);

        return template;
    }

    SetIncrements() {
        this.IgnitionAdvanceConfigOrVariableSelection.SetIncrements();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].SetIncrements();
        };
    }

    GetArrayBufferPackage() {
        var arrayBuffer = new ArrayBuffer();

        var numberOfOperations = 0;
        if(this.IgnitionAdvanceConfigOrVariableSelection.IsImmediateOperation())
            ++numberOfOperations;

        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x09 ]).buffer); //immediate group
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ numberOfOperations ]).buffer); //number of operations

        arrayBuffer = arrayBuffer.concatArray(this.IgnitionAdvanceConfigOrVariableSelection.GetArrayBufferPackage())
        
        //TODO schedule and configure outputs

        return arrayBuffer;
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

        this.EnginePositionId = 0;
        if(Increments.VariableIncrement === undefined)
            Increments.VariableIncrement = 0;
        else
            this.EnginePositionId = ++Increments.VariableIncrement;
        this.EngineRPMId = ++Increments.VariableIncrement;
        Increments.EnginePositionId = this.EnginePositionId;
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

    GetArrayBufferPackage() {
        var arrayBuffer = new ArrayBuffer();

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

        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x09 ]).buffer); //immediate group
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ numberOfOperations ]).buffer); //number of operations

        //big operation to setup Crank Cam position -> Engine Position -> Engine RPM
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x03 ]).buffer); //immediate store
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ EngineFactoryIDs.Offset + EngineFactoryIDs.RPM ]).buffer); //factory id
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ this.EngineRPMId ]).buffer); //EngineRPMId
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 1 ]).buffer);//use 1st sub operation
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0 ]).buffer);//use 1st return from sub operation
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x07 ]).buffer); //immediate store and return
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ EngineFactoryIDs.Offset + EngineFactoryIDs.Position ]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ this.CrankPriority? 1 : 0 ]).buffer); //CrankPriority
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ this.EnginePositionId ]).buffer); //EnginePositionId
        var subOperations = 0;
        if(this.CrankPositionConfigOrVariableSelection.IsImmediateOperation()) 
            subOperations++;
        arrayBuffer = arrayBuffer.concatArray(this.CrankPositionConfigOrVariableSelection.GetArrayBufferAsParameter(subOperations));
        if(this.CamPositionConfigOrVariableSelection.IsImmediateOperation()) 
            subOperations++;
        arrayBuffer = arrayBuffer.concatArray(this.CamPositionConfigOrVariableSelection.GetArrayBufferAsParameter(subOperations));
        arrayBuffer = arrayBuffer.concatArray(this.CrankPositionConfigOrVariableSelection.GetArrayBufferPackage(true));
        arrayBuffer = arrayBuffer.concatArray(this.CamPositionConfigOrVariableSelection.GetArrayBufferPackage(true));
        
        if(mapRequired) {
            arrayBuffer = arrayBuffer.concatArray(this.ManifoldAbsolutePressureConfigOrVariableSelection.GetArrayBufferPackage());
        }

        if(catRequired) {
            arrayBuffer = arrayBuffer.concatArray(this.CylinderAirTemperatureConfigOrVariableSelection.GetArrayBufferPackage());
        }
        
        if(veRequired) {
            arrayBuffer = arrayBuffer.concatArray(this.VolumetricEfficiencyConfigOrVariableSelection.GetArrayBufferPackage());
        }
        
        arrayBuffer = arrayBuffer.concatArray(this.CylinderAirmassConfigOrVariableSelection.GetArrayBufferPackage());

        return arrayBuffer;
    }
}

class ConfigOperationCylinderAirmass_SpeedDensity {
    static Name = "Speed Density";
    static Measurement = "";
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

    GetArrayBufferOperation() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([EngineFactoryIDs.Offset + EngineFactoryIDs.CylinderAirMass_SD]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([this.CylinderVolume]).buffer); //CylinderVolume
                
        return arrayBuffer;
    }

    GetArrayBufferParameters() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0 ]).buffer); //use variable
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ Increments.EngineParameters.find(a => a.Name === "Cylinder Air Temperature").Id ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0 ]).buffer); //use variable
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ Increments.EngineParameters.find(a => a.Name === "Manifold Absolute Pressure").Id ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0 ]).buffer); //use variable
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ Increments.EngineParameters.find(a => a.Name === "Volumetric Efficiency").Id ]).buffer);
                
        return arrayBuffer;
    }
}
CylinderAirmassConfigs.push(ConfigOperationCylinderAirmass_SpeedDensity);

class ConfigInjectorPulseWidth_DeadTime {
    static Name = "Dead Time";
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

    GetArrayBufferOperation() {
        var arrayBuffer = new ArrayBuffer();
        
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Math]).buffer); //Math factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([0]).buffer); //Add
        
        return arrayBuffer;
    }

    GetArrayBufferParameters(){
        var arrayBuffer = new ArrayBuffer();
        
        //add parameter 1
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 1 ]).buffer); //use immediate operation
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0 ]).buffer); //use first return
        //add parameter 2
        arrayBuffer = arrayBuffer.concatArray(this.DeadTimeConfigOrVariableSelection.GetArrayBufferAsParameter(2));

        //add parameter 1 subOperation
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x05 ]).buffer); //immediate and return
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Math]).buffer); //Math factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([3]).buffer); //Divide
        //divide parameter 1
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0 ]).buffer); //use variable
        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ Increments.FuelParameters.find(a => a.Name === "Injector Grams").Id ]).buffer);
        //divide parameter 2
        arrayBuffer = arrayBuffer.concatArray(this.FlowRateConfigOrVariableSelection.GetArrayBufferAsParameter(1));
        //divide parameter 2 subOperation
        arrayBuffer = arrayBuffer.concatArray(this.FlowRateConfigOrVariableSelection.GetArrayBufferPackage(true));

        //add parameter 2 subOperation
        arrayBuffer = arrayBuffer.concatArray(this.DeadTimeConfigOrVariableSelection.GetArrayBufferPackage(true));
                
        return arrayBuffer;

    }
}
InjectorPulseWidthConfigs.push(ConfigInjectorPulseWidth_DeadTime);

class ConfigInjectorOutputs {
    static Name = "Injector Outputs";
    static Template = getFileContents("ConfigGui/Fuel_InjectorOutputs.html");

    constructor(){
        this.GUID = getGUID();
        this.InjectorEndPositionConfigOrVariableSelection = new ConfigOrVariableSelection(
            GenericConfigs,
            "Injector End Position(ATDC)",
            "Angle",
            "FuelParameters");
        this.Outputs[0] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 1", "No Measurement");
        this.Outputs[1] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 2", "No Measurement");
        this.Outputs[2] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 3", "No Measurement");
        this.Outputs[3] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 4", "No Measurement");
        this.Outputs[4] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 5", "No Measurement");
        this.Outputs[5] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 6", "No Measurement");
        this.Outputs[6] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 7", "No Measurement");
        this.Outputs[7] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector 8", "No Measurement");
    }

    InjectorEndPositionConfigOrVariableSelection = undefined
    Outputs = [];
    TDCTable = undefined;

    GetObj() {
        var outputObj = [];
        for(var i = 0; i < this.Outputs.length; i++){
            outputObj[i] = this.Outputs[i].GetObj();
        };
        return {
            Name: GetClassProperty(this, "Name"),
            InjectorEndPositionConfigOrVariableSelection: this.InjectorEndPositionConfigOrVariableSelection.GetObj(),
            Outputs: outputObj
        };
    }

    SetObj(obj) {
        this.Detach();
        this.InjectorEndPositionConfigOrVariableSelection.SetObj(!obj? undefined : obj.InjectorEndPositionConfigOrVariableSelection);
        if(obj)
        {
            for(var i = 0; i < obj.Outputs.length; i++){
                if(!this.Outputs[i])
                    this.Outputs[i] = new ConfigTDCOutput(BooleanOutputConfigs, "Injector " + (i+1), "No Measurement")
                this.Outputs[i].SetObj(obj.Outputs[i])
            }
            for(var i = obj.Outputs.length; i < this.Outputs.length; i++){
                this.Outputs[i] = undefined;
            }
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        this.InjectorEndPositionConfigOrVariableSelection.Detach();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].Detach();
        };
    }

    Attach() {
        var thisClass = this;

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].Attach();
        };

        this.InjectorEndPositionConfigOrVariableSelection.Attach();
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);

        template = template.replace(/[$]injectorendat[$]/g, 
            this.InjectorEndPositionConfigOrVariableSelection.GetHtml());

        var outputsHTML = "";
        
        for(var i = 0; i < this.Outputs.length; i++){
            outputsHTML += this.Outputs[i].GetHtml();
        };
        
        template = template.replace(/[$]injectoroutputs[$]/g, outputsHTML);

        return template;
    }

    SetIncrements() {
        this.InjectorEndPositionConfigOrVariableSelection.SetIncrements();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].SetIncrements();
        };
    }

    GetArrayBufferPackage() {
        var arrayBuffer = new ArrayBuffer();
        
        // arrayBuffer = arrayBuffer.concatArray(new Uint16Array([2006]).buffer); //Injector Array
        // arrayBuffer = arrayBuffer.concatArray(new Uint8Array([this.NumberOfOutputs]).buffer); //Number of outputs
        // arrayBuffer = arrayBuffer.concatArray(new Float32Array(this.TDCTable.Value).buffer); //output TDCs
        // //output operations

        // arrayBuffer = arrayBuffer.concatArray(new Uint32Array([ Increments.EnginePositionId ]).buffer);
        // arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments.FuelParameters.find(a => a.Name === "Injector Pulse Width").Id ]).buffer);
        // arrayBuffer = arrayBuffer.concatArray(this.InjectorEndPositionConfigOrVariableSelection.GetArrayBuffer(true));

        return arrayBuffer;
    }
}

class ConfigTDCOutput extends ConfigOrVariableSelection {
    static Template = getFileContents("ConfigGui/TDCOutput.html");
    // static Name = "Injector Output";

    // constructor(){
    //     this.GUID = getGUID();
    // }

    // GetObj() {
    //     return {
    //         Name: GetClassProperty(this, "Name")
    //     };
    // }

    // SetObj(obj) {
    //     this.Detach();

    //     $("#" + this.GUID).replaceWith(this.GetHtml());
    //     this.Attach();
    // }

    // Detach() {
    // }

    // Attach() {
    // }

    // GetHtml() {
    //     if(!configTDCOutputTemplate)
    //         configTDCOutputTemplate = getFileContents("ConfigGui/TDCOutput.html");
    //     var template = configTDCOutputTemplate;

    //     template = template.replace(/[$]id[$]/g, this.GUID);

    //     return template;
    // }

    // SetIncrements() {
    // }

    // GetArrayBufferPackage() {
    //     var arrayBuffer = new ArrayBuffer();
        

    //     return arrayBuffer;
    // }
}