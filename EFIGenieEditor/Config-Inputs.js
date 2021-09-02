var CurrentTickVariableID = 0;
var InputRawConfigs = [];
var InputTranslationConfigs = [];
InputTranslationConfigs.push(ConfigOperation_LookupTable);

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
};

ReluctorFactoryIDs = {
    Offset: 30000,
    GM24X: 1,
    Universal1X: 2,
    UniversalMissintTooth: 3
};

class ConfigInputs {
    static Template = getFileContents("ConfigGui/Inputs.html");

    constructor(){
        this.GUID = getGUID();
    }

    Inputs = [new ConfigInput()];

    GetObj() {
        var obj  = [];

        for(var i = 0; i < this.Inputs.length; i++){
            obj.push(this.Inputs[i].GetObj());
        }

        return obj;
    }

    SetObj(obj) {
        this.Detach();
        this.Inputs = [];

        if(obj) {
            for(var i = 0; i < obj.length; i++){
                this.Inputs.push(new ConfigInput());
                this.Inputs[i].SetObj(obj[i]);
            }
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        for(var i = 0; i < this.Inputs.Length; i++){
            this.Inputs[i].Detach();
        }

        $(document).off("change."+this.GUID);
        $(document).off("click."+this.GUID);
    }

    Attach() {
        var thisClass = this;
        
        for(var i = 0; i < this.Inputs.Length; i++){
            this.Inputs[i].Attach();
        }
        
        $(document).on("change."+this.GUID, "#" + this.GUID + "-Selection", function(){
            thisClass.Detach();

            var selected = parseInt($(this).val());
            if(isNaN(selected)) {
                $("#"+ thisClass.GUID + "-name").hide();
                thisClass.Attach();
                return;
            }

            $("#"+ thisClass.GUID + "-inputconfig").html(thisClass.Inputs[selected].GetHtml());
            $("#"+ thisClass.GUID + "-name").show();
            $("#"+ thisClass.GUID + "-name").val(thisClass.Inputs[selected].Name);

            thisClass.Attach();
        });
        
        $(document).on("change."+this.GUID, "#" + this.GUID + "-name", function(){
            thisClass.Detach();

            var selected = parseInt($("#" + thisClass.GUID + "-Selection").val());
            if(isNaN(selected)) {
                thisClass.Attach();
                return;
            }

            thisClass.Inputs[selected].Name = $(this).val();
            $("#"+ thisClass.GUID).html(thisClass.GetHtml());

            thisClass.Attach();
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Add", function(){
            thisClass.Detach();
                    
            thisClass.Inputs.push(new ConfigInput());
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Delete", function(){
            thisClass.Detach();
                    
            var selected = parseInt($("#" + thisClass.GUID + "-Selection").val());
            if(isNaN(selected)) {
                thisClass.Attach();
                return;
            }
            
            thisClass.Inputs.splice(selected, 1);
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Up", function(){
            thisClass.Detach();
                    
            var selected = parseInt($("#" + thisClass.GUID + "-Selection").val());
            if(isNaN(selected) || selected === 0) {
                thisClass.Attach();
                return;
            }
            
            var temp = thisClass.Inputs[selected];
            thisClass.Inputs[selected] = thisClass.Inputs[selected - 1];
            thisClass.Inputs[selected - 1] = temp;
            $("#" + thisClass.GUID + "-Selection").val(selected - 1);
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Down", function(){
            thisClass.Detach();
                    
            var selected = parseInt($("#" + thisClass.GUID + "-Selection").val());
            if(isNaN(selected) || selected === thisClass.Inputs.length-1) {
                thisClass.Attach();
                return;
            }
            
            var temp = thisClass.Inputs[selected];
            thisClass.Inputs[selected] = thisClass.Inputs[selected + 1];
            thisClass.Inputs[selected + 1] = temp;
            $("#" + thisClass.GUID + "-Selection").val(selected + 1);
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Duplicate", function(){
            thisClass.Detach();
                    
            var selected = parseInt($("#" + thisClass.GUID + "-Selection").val());
            if(isNaN(selected)) {
                thisClass.Attach();
                return;
            }
            
            thisClass.Inputs.push(new ConfigInput());
            thisClass.Inputs[thisClass.Inputs.length-1].SetObj(thisClass.Inputs[selected].GetObj());
            $("#" + thisClass.GUID + "-Selection").append("<option value=\"" + (thisClass.Inputs.length-1) + "\"></option>")
            $("#" + thisClass.GUID + "-Selection").val(thisClass.Inputs.length-1);
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");
        
        var selected = parseInt($("#" + this.GUID + "-Selection").val());
        if(isNaN(selected))
            selected = 0;

        template = template.replace(/[$]id[$]/g, this.GUID);
        
        var inputlist = "";
        for(var i = 0; i < this.Inputs.length; i++){
            inputlist += "<option value=\"" + i + "\" " + (selected === i? "selected" : "") + ">" + this.Inputs[i].Name + "</option>";
        }
        template = template.replace(/[$]inputlist[$]/g, inputlist);

        var inputconfig = "";
        if(selected < this.Inputs.length) {
           inputconfig = this.Inputs[selected].GetHtml();
           template = template.replace(/[$]name[$]/g, this.Inputs[selected].Name);
           template = template.replace(/[$]namedivstyle[$]/g, "");
        } else {
           template = template.replace(/[$]name[$]/g, "");
           template = template.replace(/[$]namedivstyle[$]/g, " display: none;");
        }
        template = template.replace(/[$]inputconfig[$]/g, inputconfig);

        return template;
    }

    SetIncrements() {
        Increments.CurrentTickId = 1;
        if(Increments.VariableIncrement === undefined)
            Increments.VariableIncrement = 1;
        else
            Increments.CurrentTickId = ++Increments.VariableIncrement;

        for(var i = 0; i < this.Inputs.length; i++){
            this.Inputs[i].SetIncrements();
        }
    }

    GetObjPackage() {
        var obj = { value: [
            { type: "PackageOptions", value: { Group: this.Inputs.length + 1 }}, //group
            
            { type: "PackageOptions", value: { Immediate: true, Store: true }}, //immediate store
            { type: "UINT32", value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.GetTick }, //GetTick factory ID
            { type: "UINT32", value: Increments.CurrentTickId }
        ]};

        for(var i = 0; i < this.Inputs.length; i++){
            obj.value.push({ obj: this.Inputs[i].GetObjPackage()});
        }

        return obj;
    }
}

class ConfigInput {
    static Template = getFileContents("ConfigGui/Input.html");

    constructor(){
        this.GUID = getGUID();
    }

    Name = "Input";
    RawConfig = undefined;
    TranslationConfig = undefined;
    TranslationMeasurement = "None";

    GetObj() {
        return { 
            Name: this.Name,
            RawConfig: this.RawConfig? this.RawConfig.GetObj() : undefined, 
            TranslationConfig: this.TranslationConfig? this.TranslationConfig.GetObj() : undefined,
            TranslationMeasurement: this.TranslationMeasurement
        };
    }

    SetObj(obj) {
        this.Detach();
        if(obj) {
            this.Name = obj.Name;
            this.RawConfig = undefined;
            if(obj.RawConfig){
                for(var i = 0; i < InputRawConfigs.length; i++)
                {
                    if(InputRawConfigs[i].Name === obj.RawConfig.Name) {
                        this.RawConfig = new InputRawConfigs[i]();
                        this.RawConfig.SetObj(obj.RawConfig);
                        break;
                    }
                }
            }
            this.TranslationConfig = undefined;
            if(obj.TranslationConfig){
                for(var i = 0; i < InputTranslationConfigs.length; i++)
                {
                    if(InputTranslationConfigs[i].Name === obj.TranslationConfig.Name) {
                        this.TranslationConfig = new InputTranslationConfigs[i](true);
                        this.TranslationConfig.XLabel = "Raw Input";
                        this.TranslationConfig.SetObj(obj.TranslationConfig);
                        break;
                    }
                }
            }
            this.TranslationMeasurement = obj.TranslationMeasurement;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
        if(this.RawConfig) 
            this.RawConfig.Detach();
        if(this.TranslationConfig) 
            this.TranslationConfig.Detach();
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-rawselection", function(){
            thisClass.Detach();

            var val = $(this).val();
            if(val === "-1")
                thisClass.RawConfig = undefined;
            else
                thisClass.RawConfig = new InputRawConfigs[val]();
            
            if(thisClass.RawConfig) {
                $("#" + thisClass.GUID + "-raw").html(thisClass.RawConfig.GetHtml());
                $("#" + thisClass.GUID + "-rawmeasurement").html(GetMeasurementDisplay(GetClassProperty(thisClass.RawConfig, "Measurement")));
            } else {
                $("#" + thisClass.GUID + "-raw").html("");
                $("#" + thisClass.GUID + "-rawmeasurement").html("");
            }
                
            var translationSelections = thisClass.GetTranslationSelections();
            $("#" + thisClass.GUID + "-translationselection").html(translationSelections.Html);
            
            if(translationSelections.Available) {
                $("#" + thisClass.GUID + "-translationselection").prop( "disabled", false );
            } else {
                $("#" + thisClass.GUID + "-translationselection").prop( "disabled", true );
                $("#" + thisClass.GUID + "-translationmeasurement").html("");
            }
            
            thisClass.Attach();
        });
        $(document).on("change."+this.GUID, "#" + this.GUID + "-translationselection", function(){
            thisClass.Detach();

            var val = $(this).val();
            if(val === "-1")
                thisClass.TranslationConfig = undefined;
            else
            {
                thisClass.TranslationConfig = new InputTranslationConfigs[val](true);
                thisClass.TranslationConfig.XLabel = "Raw Input";
            }
            
            if(thisClass.TranslationConfig)
                $("#" + thisClass.GUID + "-translation").html(thisClass.TranslationConfig.GetHtml());
            else
                $("#" + thisClass.GUID + "-translation").html("");
            
            $("#" + thisClass.GUID + "-translationmeasurement").html(thisClass.GetTranslationMeasurement());

            thisClass.Attach();
        });
        $(document).on("change."+this.GUID, "#" + this.GUID + "-translationmeasurementselection", function(){
            thisClass.Detach();

            thisClass.TranslationMeasurement = $(this).val();

            thisClass.Attach();
        });

        if(this.RawConfig) 
            this.RawConfig.Attach();
        if(this.TranslationConfig) 
            this.TranslationConfig.Attach();
    }

    GetTranslationMeasurement() {
        if(!this.TranslationConfig)
            return "";

        var translationMeasurement = this.TranslationConfig.constructor.Measurement;
        if(translationMeasurement === "Selectable")
        {
            var selections = "<select id=\"" + this.GUID + "-translationmeasurementselection\">";
            var measurements = Object.keys(Measurements);
            for(var i = 0; i < measurements.length; i++)
            {
                selections += "<option value=\"" + measurements[i] + "\"" + (this.TranslationMeasurement === measurements[i]? " selected" : "") + ">" + GetMeasurementDisplay(measurements[i]) + "</option>"
            }

            selections = selections + "</select>";
            return selections;
        }
    }

    GetTranslationSelections() {
        var availableTranslation = false;
        var translationSelections;
        if(this.RawConfig)
        {
            var output = GetClassProperty(this.RawConfig, "Output");
            var translationSelected = false;
            if(output !== undefined)
            {
                for(var i = 0; i < InputTranslationConfigs.length; i++)
                {
                    var inputs = InputTranslationConfigs[i].Inputs;
                    var validInputCnt = 0;
                    for(var inp = 0; inp < inputs.length; inp++){
                        if(inputs[inp] === "CurrentTick") //setup like this for operations that require current tick as input
                            continue;
                        if(inputs[inp] !== output) {
                            validInputCnt = 0;
                            break;
                        }
                        validInputCnt++;
                    }
                    if(validInputCnt !== 1)
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
        
        var rawSelections;
        var rawSelected = false;
        for(var i = 0; i < InputRawConfigs.length; i++)
        {
            var selected = false;
            if(this.RawConfig && this.RawConfig instanceof InputRawConfigs[i]){
                selected = true;
                rawSelected = true;
            }

            rawSelections += "<option value=\"" + i + "\"" + (selected? " selected" : "") + ">" + InputRawConfigs[i].Name + "</option>"
        }
        if(!rawSelected)
            this.RawConfig = undefined;
        rawSelections = "<option value=\"-1\" disabled" + (rawSelected? "" : " selected") + ">Select</option>" + rawSelections;
        template = template.replace(/[$]rawselections[$]/g, rawSelections);

        var translationSelections = this.GetTranslationSelections();
        template = template.replace(/[$]translationselections[$]/g, translationSelections.Html);
        template = template.replace(/[$]translationdisabled[$]/g, translationSelections.Available? "" : "disabled");
        
        if(this.RawConfig) {
            template = template.replace(/[$]raw[$]/g, this.RawConfig.GetHtml());
            template = template.replace(/[$]rawvalue[$]/g, "");//this is for interactivity later
            template = template.replace(/[$]rawmeasurement[$]/g, GetMeasurementDisplay(GetClassProperty(this.RawConfig, "Measurement")));
        } else {
            template = template.replace(/[$]raw[$]/g, "");
            template = template.replace(/[$]rawvalue[$]/g, "");
            template = template.replace(/[$]rawmeasurement[$]/g, "");
        }
        if(this.TranslationConfig) {
            template = template.replace(/[$]translation[$]/g, this.TranslationConfig.GetHtml());
            template = template.replace(/[$]translationmeasurement[$]/g, this.GetTranslationMeasurement());
            template = template.replace(/[$]translationvalue[$]/g, "");//this is for interactivity later
        } else {
            template = template.replace(/[$]translation[$]/g, "");
            template = template.replace(/[$]translationmeasurement[$]/g, "");
            template = template.replace(/[$]translationvalue[$]/g, "");
        }

        this.Detach();
        this.Attach();

        return template;
    }

    InputTranslationId = -1;
    InputRawId = -1;
    SetIncrements() {
        this.InputRawId = -1;
        this.InputTranslationId = -1;

        if(!this.RawConfig) 
            return;

        if(this.TranslationConfig) {
            this.InputTranslationId = 1;
            if(Increments.VariableIncrement === undefined)
                Increments.VariableIncrement = 1;
            else
                this.InputTranslationId = ++Increments.VariableIncrement;
                
            if(Increments.Inputs === undefined)
                Increments.Inputs = [];
            Increments.Inputs.push( { 
                Name: this.Name, 
                Id: this.InputTranslationId, 
                Type: GetClassProperty(this.TranslationConfig, "Output"),
                Measurement: this.TranslationConfig.constructor.Measurement === "Selectable"? this.TranslationMeasurement : this.TranslationConfig.constructor.Measurement
            });
        }
        
        this.InputRawId = 1;
        if(Increments.VariableIncrement === undefined)
            Increments.VariableIncrement = 1;
        else
            this.InputRawId = ++Increments.VariableIncrement;
            
        if(Increments.Inputs === undefined)
            Increments.Inputs = [];
        Increments.Inputs.push( { 
            Name: this.Name, 
            Id: this.InputRawId,
            Type: GetClassProperty(this.RawConfig, "Output"),
            Measurement: GetClassProperty(this.RawConfig, "Measurement")
        });

        if(this.RawConfig && this.RawConfig.SetIncrements)
            this.RawConfig.SetIncrements();
        if(this.TranslationConfig && this.TranslationConfig.SetIncrements)
            this.TranslationConfig.SetIncrements();
    }

    GetObjPackage() {
        var rawOutput = GetClassProperty(this.RawConfig, "Output");
        var translationInputs = GetClassProperty(this.TranslationConfig, "Inputs");
        if(!this.RawConfig) 
            return arrayBuffer;

        if(Increments.VariableIncrement === undefined)
            throw "Set Increments First";

        var output = GetClassProperty(this.RawConfig, "Output");

        var obj = { value: []};

        if(this.TranslationConfig) {
            if(this.InputTranslationId === -1)
                throw "Set Increments First";

            obj.value.push({ type: "PackageOptions", value: { Immediate: true, Store: true }});
            obj.value.push({ obj: this.TranslationConfig.GetObjOperation()});
            obj.value.push({ type: "UINT32", value: this.InputTranslationId });//sensorTranslationID
            if(translationInputs) {
                for(var i = 0; i < translationInputs.length; i++){
                    //add universal inputs for translation
                    if(translationInputs[i] === "CurrentTick"){
                        obj.value.push({ type: "UINT8", value: 0 }); //use variable
                        obj.value.push({ type: "UINT32", value: Increments.CurrentTickId }); //use CurrentTick variable
                    } else if (translationInputs[i] === output) {
                        obj.value.push({ type: "UINT8", value: 1 }); //use 1st operation
                        obj.value.push({ type: "UINT8", value: 0 }); //use 1st return from operation
                    }
                }
            }
        }
            
        if(this.InputRawId === -1)
            throw "Set Increments First";
        
        obj.value.push({ type: "PackageOptions", value: { Immediate: true, Store: true, Return: this.TranslationConfig !== undefined }}); //immediate and store variables, return if TranslationConfig
        obj.value.push({ obj: this.RawConfig.GetObjOperation()});
        obj.value.push({ type: "UINT32", value: this.InputRawId });//sensorID

        return obj;
    }
}

class ConfigOperation_AnalogPinRead {
    static Name = "Analog Pin";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Voltage";
    static Template = getFileContents("ConfigGui/Operation_AnalogPinRead.html");

    constructor(){
        this.GUID = getGUID();
    }

    Pin = 0;

    GetObj() {
        return {
            Name: GetClassProperty(this, "Name"),
            Pin: this.Pin
        };
    }

    SetObj(obj) {
        if(obj)
            this.Pin = obj.Pin;
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Detach();

            thisClass.Pin = parseInt($(this).val());

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);

        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.AnalogInput}, //factory ID
            { type: "UINT16", value: this.Pin}, //pin
        ]};
    }
}
InputRawConfigs.push(ConfigOperation_AnalogPinRead);

class ConfigOperation_DigitalPinRead {
    static Name = "Digital Pin";
    static Output = "bool";
    static Inputs = [];
    static Measurement = "";
    static Template = getFileContents("ConfigGui/Operation_DigitalPinRead.html");

    constructor(){
        this.GUID = getGUID();
    }
    
    Pin = 0;
    Inverted = 0;

    GetObj() {
        return { 
            Name: GetClassProperty(this, "Name"),
            Pin: this.Pin,
            Inverted: this.Inverted
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Pin = obj.Pin;
            this.Inverted = obj.Inverted;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Detach();

            thisClass.Pin = parseInt($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-inverted", function(){
            thisClass.Detach();

            thisClass.Inverted = this.checked? 1 : 0;

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]inverted[$]/g, (this.Inverted === 1? "checked": ""));

        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalInput}, //factory ID
            { type: "UINT16", value: this.Pin}, //pin
            { type: "BOOL", value: this.Inverted}, //inverted
        ]};
    }
}
InputRawConfigs.push(ConfigOperation_DigitalPinRead);

class ConfigOperation_DigitalPinRecord {
    static Name = "Digital Pin (Record)";
    static Output = "Record";
    static Inputs = [];
    static Measurement = "";
    static Template = getFileContents("ConfigGui/Operation_DigitalPinRecord.html");

    constructor(){
        this.GUID = getGUID();
    }
    
    Pin = 0;
    Inverted = 0;
    Length = 2;

    GetObj() {
        return { 
            Name: GetClassProperty(this, "Name"),
            Pin: this.Pin,
            Inverted: this.Inverted,
            Length: this.Length
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Pin = obj.Pin;
            this.Inverted = obj.Inverted;
            this.Length = obj.Length;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Detach();

            thisClass.Pin = parseInt($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-inverted", function(){
            thisClass.Detach();

            thisClass.Inverted = this.checked? 1 : 0;

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-length", function(){
            thisClass.Detach();

            thisClass.Length = parseInt($(this).val());

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]inverted[$]/g, (this.Inverted === 1? "checked": ""));
        template = template.replace(/[$]length[$]/g, this.Length);

        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalPinRecord}, //factory ID
            { type: "UINT16", value: this.Pin}, //pin
            { type: "BOOL", value: this.Inverted}, //inverted
            { type: "UINT16", value: this.Length}, //length
        ]};
    }
}
InputRawConfigs.push(ConfigOperation_DigitalPinRecord);

class ConfigOperation_DutyCyclePinRead {
    static Name = "Duty Cycle Pin";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Percentage";
    static Template = getFileContents("ConfigGui/Operation_DutyCyclePinRead.html");

    constructor(){
        this.GUID = getGUID();
    }
    
    Pin = 0;
    MinFrequency = 1000;

    GetObj() {
        return { 
            Name: GetClassProperty(this, "Name"),
            Pin: this.Pin,
            MinFrequency: this.MinFrequency
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Pin = obj.Pin;
            this.MinFrequency = obj.MinFrequency;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Detach();

            thisClass.Pin = parseInt($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-minFrequency", function(){
            thisClass.Detach();

            thisClass.MinFrequency = parseInt($(this).val());

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]minFrequency[$]/g, this.MinFrequency);

        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DutyCyclePinRead}, //factory ID
            { type: "UINT16", value: this.Pin}, //pin
            { type: "UINT16", value: this.MinFrequency}, //minFrequency
        ]};
    }
}
InputRawConfigs.push(ConfigOperation_DutyCyclePinRead);

class ConfigOperation_FrequencyPinRead {
    static Name = "Frequency Pin";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Frequency";
    static Template = getFileContents("ConfigGui/Operation_FrequencyPinRead.html");

    constructor(){
        this.GUID = getGUID();
    }
    
    Pin = 0;
    MinFrequency = 1000;

    GetObj() {
        return { 
            Name: GetClassProperty(this, "Name"),
            Pin: this.Pin,
            MinFrequency: this.MinFrequency
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Pin = obj.Pin;
            this.MinFrequency = obj.MinFrequency;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Detach();

            thisClass.Pin = parseInt($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-minFrequency", function(){
            thisClass.Detach();

            thisClass.MinFrequency = parseInt($(this).val());

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]minFrequency[$]/g, this.MinFrequency);

        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.FrequencyPinRead}, //factory ID
            { type: "UINT16", value: this.Pin}, //pin
            { type: "UINT16", value: this.MinFrequency}, //minFrequency
        ]};
    }
}
InputRawConfigs.push(ConfigOperation_FrequencyPinRead);

class ConfigOperation_PulseWidthPinRead {
    static Name = "Pulse Width Pin";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Time";
    static Template = getFileContents("ConfigGui/Operation_PulseWidthPinRead.html");

    constructor(){
        this.GUID = getGUID();
    }
    
    Pin = 0;
    MinFrequency = 1000;

    GetObj() {
        return { 
            Name: GetClassProperty(this, "Name"),
            Pin: this.Pin,
            MinFrequency: this.MinFrequency
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Pin = obj.Pin;
            this.MinFrequency = obj.MinFrequency;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Detach();

            thisClass.Pin = parseInt($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-minFrequency", function(){
            thisClass.Detach();

            thisClass.MinFrequency = parseInt($(this).val());

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]minFrequency[$]/g, this.MinFrequency);

        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.PulseWidthPinRead}, //factory ID
            { type: "UINT16", value: this.Pin}, //pin
            { type: "UINT16", value: this.MinFrequency}, //minFrequency
        ]};
    }
}
InputRawConfigs.push(ConfigOperation_PulseWidthPinRead);

class ConfigOperation_Polynomial {
    static Name = "Polynomial";
    static Output = "float";
    static Inputs = ["float"];
    static Measurement = "Selectable";
    static Template = getFileContents("ConfigGui/Operation_Polynomial.html");

    constructor(){
        this.GUID = getGUID();
    }
    
    MinValue = 0;
    MaxValue = 1;
    Degree = 3;
    A = [0, 0, 0];

    GetObj() {
        return { 
            Name: GetClassProperty(this, "Name"),
            MinValue: this.MinValue,
            MaxValue: this.MaxValue,
            Degree: this.Degree,
            A: this.A.slice()
        };
    }

    SetObj(obj) {
        if(obj) {
            this.MinValue = obj.MinValue;
            this.MaxValue = obj.MaxValue;
            this.Degree = obj.Degree;
            this.A = obj.A.slice();
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-min", function(){
            thisClass.Detach();

            thisClass.MinValue = parseFloat($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-max", function(){
            thisClass.Detach();

            thisClass.MaxValue = parseFloat($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-degree", function(){
            thisClass.Detach();

            thisClass.Degree = parseInt($(this).val());

            var oldA = thisClass.A;

            thisClass.A = new Array(thisClass.Degree);
            for(var i = 0; i < thisClass.A.length; i++){
                if(i < oldA.length)
                    thisClass.A[i] = oldA[i];
                else
                    thisClass.A[i] = 0;
            }
            $("#" + thisClass.GUID + "-coefficients").html(thisClass.GetCoefficientsHtml());
            
            thisClass.Attach();
        });
        
        $(document).on("change."+this.GUID, "#" + this.GUID + "-A", function(){
            thisClass.Detach();

            var index = $(this).data("index");
            var val = parseFloat($(this).val());

            thisClass.A[index] = val;
            
            thisClass.Attach();
        });
    }

    GetCoefficientsHtml() {
        var coefficients = "<label>Coefficients:</label>";
        for(var i = this.Degree-1; i > 0; i--)
        {
            coefficients += "<input id=\"" + this.GUID + "-A\" data-index=\"" + i + "\" type=\"number\" step=\"0.1\" value=\"" + this.A[i] + "\"/>";
            if(i > 1)
                coefficients += " x<sup>" + i + "</sup> + ";
            else
                coefficients += " x + ";
        }
        coefficients += "<input id=\"" + this.GUID + "-A\" data-index=\"0\" type=\"number\" step=\"0\" value=\"" + this.A[0] + "\"/>";

        return coefficients;
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]min[$]/g, this.MinValue);
        template = template.replace(/[$]max[$]/g, this.MaxValue);
        template = template.replace(/[$]degree[$]/g, this.Degree);

        template = template.replace(/[$]coefficients[$]/g, this.GetCoefficientsHtml());

        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: "FLOAT", value: this.MinValue}, //MinValue
            { type: "FLOAT", value: this.MaxValue}, //MaxValue
            { type: "UINT8", value: this.Degree}, //Degree
            { type: "FLOAT", value: this.A}, //coefficients
        ]};
    }
}
InputTranslationConfigs.push(ConfigOperation_Polynomial);


class ConfigOperation_ReluctorGM24x {
    static Name = "Reluctor GM 24X";
    static Output = "ReluctorResult";
    static Inputs = ["Record", "CurrentTick"];
    static Measurement = "ReluctorResult";

    constructor(){
        this.GUID = getGUID();
    }
    

    GetObj() {
        return { 
            Name: GetClassProperty(this, "Name")
        };
    }

    SetObj(obj) {
    }

    Detach() {
    }

    Attach() {
    }

    GetHtml() {
        return "";
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.GM24X}, //factory ID
        ]};
    }
}
InputTranslationConfigs.push(ConfigOperation_ReluctorGM24x);

class ConfigOperation_ReluctorUniversal1x {
    static Name = "Reluctor Universal 1X";
    static Output = "ReluctorResult";
    static Inputs = ["Record", "CurrentTick"];
    static Measurement = "ReluctorResult";
    static Template = getFileContents("ConfigGui/Operation_ReluctorUniversal1x.html");

    constructor(){
        this.GUID = getGUID();
    }
    
    
    RisingPosition = 0;
    FallingPosition = 180;

    GetObj() {
        return { 
            Name: GetClassProperty(this, "Name"),
            RisingPosition: this.RisingPosition,
            FallingPosition: this.FallingPosition
        };
    }

    SetObj(obj) {
        if(obj) {
            this.RisingPosition = obj.RisingPosition;
            this.FallingPosition = obj.FallingPosition;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-rising", function(){
            thisClass.Detach();

            thisClass.RisingPosition = parseFloat($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-falling", function(){
            thisClass.Detach();

            thisClass.FallingPosition = parseFloat($(this).val());

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]rising[$]/g, this.RisingPosition);
        template = template.replace(/[$]falling[$]/g, this.FallingPosition);

        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.Universal1X}, //factory ID
            { type: "FLOAT", value: this.RisingPosition}, //RisingPosition
            { type: "FLOAT", value: this.FallingPosition}, //FallingPosition
        ]};
    }
}
InputTranslationConfigs.push(ConfigOperation_ReluctorUniversal1x);

class ConfigOperation_ReluctorUniversalMissingTeeth {
    static Name = "Reluctor Universal Missing Teeth";
    static Output = "ReluctorResult";
    static Inputs = ["Record", "CurrentTick"];
    static Measurement = "ReluctorResult";
    static Template = getFileContents("ConfigGui/Operation_ReluctorUniversalMissingTeeth.html");

    constructor(){
        this.GUID = getGUID();
    }
    
    
    FirstToothPosition = 0;
    ToothWidth = 5;
    NumberOfTeeth = 36;
    NumberOfTeethMissing = 1;

    GetObj() {
        return { 
            Name: GetClassProperty(this, "Name"),
            FirstToothPosition: this.FirstToothPosition,
            ToothWidth: this.ToothWidth,
            NumberOfTeeth: this.NumberOfTeeth,
            NumberOfTeethMissing: this.NumberOfTeethMissing
        };
    }

    SetObj(obj) {
        if(obj) {
            this.FirstToothPosition = obj.FirstToothPosition;
            this.ToothWidth = obj.ToothWidth;
            this.NumberOfTeeth = obj.NumberOfTeeth;
            this.NumberOfTeethMissing = obj.NumberOfTeethMissing;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-firstToothPosition", function(){
            thisClass.Detach();

            thisClass.FirstToothPosition = parseFloat($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-toothWidth", function(){
            thisClass.Detach();

            thisClass.ToothWidth = parseFloat($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-numberOfTeeth", function(){
            thisClass.Detach();

            thisClass.NumberOfTeeth = parseInt($(this).val());

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-numberOfTeethMissing", function(){
            thisClass.Detach();

            thisClass.NumberOfTeethMissing = parseInt($(this).val());

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]firstToothPosition[$]/g, this.FirstToothPosition);
        template = template.replace(/[$]toothWidth[$]/g, this.ToothWidth);
        template = template.replace(/[$]numberOfTeeth[$]/g, this.NumberOfTeeth);
        template = template.replace(/[$]numberOfTeethMissing[$]/g, this.NumberOfTeethMissing);

        return template;
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.UniversalMissintTooth}, //factory ID
            { type: "FLOAT", value: this.FirstToothPosition}, //FirstToothPosition
            { type: "FLOAT", value: this.ToothWidth}, //ToothWidth
            { type: "UINT8", value: this.NumberOfTeeth}, //NumberOfTeeth
            { type: "UINT8", value: this.NumberOfTeethMissing}, //NumberOfTeethMissing
        ]};
    }
}
InputTranslationConfigs.push(ConfigOperation_ReluctorUniversalMissingTeeth);