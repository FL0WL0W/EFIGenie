var SystemChannel = 1
var CurrentTickVariableID = 0;
var InputRawChannel = 2;
var InputRawConfigs = [];
var InputTranslationChannel = 3;
var InputTranslationConfigs = [];
InputTranslationConfigs.push(ConfigOperation_LookupTable);

OperationArchitectureFactoryIDs = {
    Offset : 10000,
    Table : 1,
    Lookup: 2,
    Polynomial: 3,
    Math: 4,
    Static: 5,
    FaultDetection: 6
}

EmbeddedOperationsFactoryIDs = {
    Offset: 20000,
    AnalogInput: 1,
    DigitalInput: 2,
    DigitalPinRecord: 3,
    DutyCyclePinRead: 4,
    FrequencyPinRead: 5,
    PulseWidthPinRead: 6
};

ReluctorFactoryIDs = {
    Offset: 30000,
    GM24X: 1,
    Universal2X: 2
};

var configInputsTemplate;
class ConfigInputs {
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

        for(var i = 0; i < obj.length; i++){
            this.Inputs.push(new ConfigInput());
            this.Inputs[i].SetObj(obj[i]);
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
        if(!configInputsTemplate)
            configInputsTemplate = getFileContents("ConfigGui/Inputs.html");
        var template = configInputsTemplate;
        
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
        for(var i = 0; i < this.Inputs.length; i++){
            this.Inputs[i].SetIncrements();
        }
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        for(var i = 0; i < this.Inputs.length; i++){
            arrayBuffer = arrayBuffer.concatArray(this.Inputs[i].GetArrayBuffer())
        }

        return arrayBuffer;
    }
}

var configInputTemplate;
class ConfigInput {
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
                    this.TranslationConfig.SetObj(obj.TranslationConfig);
                    break;
                }
            }
        }
        this.TranslationMeasurement = obj.TranslationMeasurement;
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
                thisClass.TranslationConfig = new InputTranslationConfigs[val](true);
            
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
        if(!configInputTemplate)
            configInputTemplate = getFileContents("ConfigGui/Input.html");
        var template = configInputTemplate;

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
            this.Channel = InputTranslationChannel;
            this.InputTranslationId = 0;
            if(Increments.InputTranslationIncrement === undefined)
                Increments.InputTranslationIncrement = 0;
            else
                this.InputTranslationId = ++Increments.InputTranslationIncrement;
                
            if(Increments.Inputs === undefined)
                Increments.Inputs = [];
            Increments.Inputs.push( { 
                Name: this.Name, 
                Channel: InputTranslationChannel,
                Id: this.InputTranslationId, 
                Type: GetClassProperty(this.TranslationConfig, "Output"),
                Measurement: this.TranslationConfig.constructor.Measurement === "Selectable"? this.TranslationMeasurement : this.TranslationConfig.constructor.Measurement
            });
        } else {
            this.Channel = InputRawChannel;
        }
        
        this.InputRawId = 0;
        if(Increments.InputRawIncrement === undefined)
            Increments.InputRawIncrement = 0;
        else
            this.InputRawId = ++Increments.InputRawIncrement;
            
        if(Increments.Inputs === undefined)
            Increments.Inputs = [];
        Increments.Inputs.push( { 
            Name: this.Name, 
            Channel: InputRawChannel,
            Id: this.InputRawId,
            Type: GetClassProperty(this.RawConfig, "Output"),
            Measurement: GetClassProperty(this.RawConfig, "Measurement")
        });

        if(this.RawConfig && this.RawConfig.SetIncrements)
            this.RawConfig.SetIncrements();
        if(this.TranslationConfig && this.TranslationConfig.SetIncrements)
            this.TranslationConfig.SetIncrements();
    }

    GetArrayBuffer() {
        var rawOutput = GetClassProperty(this.RawConfig, "Output");
        var translationInputs = GetClassProperty(this.TranslationConfig, "Inputs");
        var translationInputIndex = 0;
        var arrayBuffer = new ArrayBuffer();
        if(!this.RawConfig) 
            return arrayBuffer;

        if(Increments.InputRawIncrement === undefined)
            throw "Set Increments First";

        var output = GetClassProperty(this.RawConfig, "Output");

        if(this.TranslationConfig) {
            if(this.InputTranslationId === -1)
                throw "Set Increments First";

            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x03 ]).buffer); //immediate and store variables
            arrayBuffer = arrayBuffer.concatArray(this.TranslationConfig.GetArrayBuffer());
            arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ InputTranslationChannel]).buffer); //variable channel
            arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ this.InputTranslationId ]).buffer); //sensorTranslationID
            while(translationInputs && translationInputIndex < translationInputs.length && translationInputs[translationInputIndex] !== output){
                //add universal inputs for translation
                if(translationInputs[translationInputIndex] === "CurrentTick"){
                    //TODO
                }
                translationInputIndex++;
            }
            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 1 ]).buffer); //use 1st operation return as input parameter
        }
            
        if(this.InputRawId === -1)
            throw "Set Increments First";
        
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ 0x07 ]).buffer); //immediate store and return variables
        arrayBuffer = arrayBuffer.concatArray(this.RawConfig.GetArrayBuffer());
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ InputRawChannel ]).buffer); //variable channel | immediate
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ this.InputRawId ]).buffer); //sensorID
        
        while(translationInputs && translationInputIndex < translationInputs.length && translationInputs[translationInputIndex] !== output){
            //add universal inputs for translation
            if(translationInputs[translationInputIndex] === "CurrentTick"){
                //TODO
            }
            translationInputIndex++;
        }

        return arrayBuffer;
    }
}

var configOperation_AnalogPinReadTemplate;
class ConfigOperation_AnalogPinRead {
    static Name = "Analog Pin";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Voltage";

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
        if(!configOperation_AnalogPinReadTemplate)
            configOperation_AnalogPinReadTemplate = getFileContents("ConfigGui/Operation_AnalogPinRead.html");
        var template = configOperation_AnalogPinReadTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.AnalogInput]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.Pin]).buffer); //pin
        
        return arrayBuffer;
    }
}
InputRawConfigs.push(ConfigOperation_AnalogPinRead);

var configOperation_DigitalPinReadTemplate;
class ConfigOperation_DigitalPinRead {
    static Name = "Digital Pin";
    static Output = "bool";
    static Inputs = [];
    static Measurement = "";

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
        this.Pin = obj.Pin;
        this.Inverted = obj.Inverted;
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
        if(!configOperation_DigitalPinReadTemplate)
            configOperation_DigitalPinReadTemplate = getFileContents("ConfigGui/Operation_DigitalPinRead.html");
        var template = configOperation_DigitalPinReadTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]inverted[$]/g, (this.Inverted === 1? "checked": ""));

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalInput]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.Pin]).buffer); //pin
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([this.Inverted]).buffer); //inverted
        
        return arrayBuffer;
    }
}
InputRawConfigs.push(ConfigOperation_DigitalPinRead);

var configOperation_DigitalPinRecordTemplate;
class ConfigOperation_DigitalPinRecord {
    static Name = "Digital Pin (Record)";
    static Output = "Record";
    static Inputs = [];
    static Measurement = "";

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
        this.Pin = obj.Pin;
        this.Inverted = obj.Inverted;
        this.Length = obj.Length;
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
        if(!configOperation_DigitalPinRecordTemplate)
            configOperation_DigitalPinRecordTemplate = getFileContents("ConfigGui/Operation_DigitalPinRecord.html");
        var template = configOperation_DigitalPinRecordTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]inverted[$]/g, (this.Inverted === 1? "checked": ""));
        template = template.replace(/[$]length[$]/g, this.Length);

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint32Array([EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalPinRecord]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.Pin]).buffer); //pin
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([this.Inverted]).buffer); //inverted
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.Length]).buffer); //length
        
        return arrayBuffer;
    }
}
InputRawConfigs.push(ConfigOperation_DigitalPinRecord);

var configOperation_DutyCyclePinReadTemplate;
class ConfigOperation_DutyCyclePinRead {
    static Name = "Duty Cycle Pin";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Percentage";

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
        this.Pin = obj.Pin;
        this.MinFrequency = obj.MinFrequency;
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
        if(!configOperation_DutyCyclePinReadTemplate)
            configOperation_DutyCyclePinReadTemplate = getFileContents("ConfigGui/Operation_DutyCyclePinRead.html");
        var template = configOperation_DutyCyclePinReadTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]minFrequency[$]/g, this.MinFrequency);

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DutyCyclePinRead]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.Pin]).buffer); //pin
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.MinFrequency]).buffer); //minFrequency
        
        return arrayBuffer;
    }
}
InputRawConfigs.push(ConfigOperation_DutyCyclePinRead);

var configOperation_FrequencyPinReadTemplate;
class ConfigOperation_FrequencyPinRead {
    static Name = "Frequency Pin";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Frequency";

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
        this.Pin = obj.Pin;
        this.MinFrequency = obj.MinFrequency;
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
        if(!configOperation_FrequencyPinReadTemplate)
            configOperation_FrequencyPinReadTemplate = getFileContents("ConfigGui/Operation_FrequencyPinRead.html");
        var template = configOperation_FrequencyPinReadTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]minFrequency[$]/g, this.MinFrequency);

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.FrequencyPinRead]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.Pin]).buffer); //pin
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.MinFrequency]).buffer); //minFrequency
        
        return arrayBuffer;
    }
}
InputRawConfigs.push(ConfigOperation_FrequencyPinRead);

var configOperation_PulseWidthPinReadTemplate;
class ConfigOperation_PulseWidthPinRead {
    static Name = "Pulse Width Pin";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Time";

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
        this.Pin = obj.Pin;
        this.MinFrequency = obj.MinFrequency;
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
        if(!configOperation_PulseWidthPinReadTemplate)
            configOperation_PulseWidthPinReadTemplate = getFileContents("ConfigGui/Operation_PulseWidthPinRead.html");
        var template = configOperation_PulseWidthPinReadTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, this.Pin);
        template = template.replace(/[$]minFrequency[$]/g, this.MinFrequency);

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.PulseWidthPinRead]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.Pin]).buffer); //pin
        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.MinFrequency]).buffer); //minFrequency
        
        return arrayBuffer;
    }
}
InputRawConfigs.push(ConfigOperation_PulseWidthPinRead);

var configOperation_PolynomialTemplate;
class ConfigOperation_Polynomial {
    static Name = "Polynomial";
    static Output = "float";
    static Inputs = ["float"];
    static Measurement = "Selectable";

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
        this.MinValue = obj.MinValue;
        this.MaxValue = obj.MaxValue;
        this.Degree = obj.Degree;
        this.A = obj.A.slice();
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
        if(!configOperation_PolynomialTemplate)
            configOperation_PolynomialTemplate = getFileContents("ConfigGui/Operation_Polynomial.html");
        var template = configOperation_PolynomialTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]min[$]/g, this.MinValue);
        template = template.replace(/[$]max[$]/g, this.MaxValue);
        template = template.replace(/[$]degree[$]/g, this.Degree);

        template = template.replace(/[$]coefficients[$]/g, this.GetCoefficientsHtml());

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([this.MinValue]).buffer); //MinValue
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([this.MaxValue]).buffer); //MaxValue
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([this.Degree]).buffer); //Degree
        arrayBuffer = arrayBuffer.concatArray(new Float32Array(this.A).buffer); //coefficients
        
        return arrayBuffer;
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

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.GM24X]).buffer); //factory ID
        
        return arrayBuffer;
    }
}
InputTranslationConfigs.push(ConfigOperation_ReluctorGM24x);

var configOperation_ReluctorUniversal2xTemplate;
class ConfigOperation_ReluctorUniversal2x {
    static Name = "Reluctor Universal 2X";
    static Output = "ReluctorResult";
    static Inputs = ["Record", "CurrentTick"];
    static Measurement = "ReluctorResult";

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
        this.RisingPosition = obj.RisingPosition;
        this.FallingPosition = obj.FallingPosition;
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
        if(!configOperation_ReluctorUniversal2xTemplate)
            configOperation_ReluctorUniversal2xTemplate = getFileContents("ConfigGui/Operation_ReluctorUniversal2x.html");
        var template = configOperation_ReluctorUniversal2xTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]rising[$]/g, this.RisingPosition);
        template = template.replace(/[$]falling[$]/g, this.FallingPosition);

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.Universal2X]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([this.RisingPosition]).buffer); //MinValue
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([this.FallingPosition]).buffer); //MaxValue
        
        return arrayBuffer;
    }
}
InputTranslationConfigs.push(ConfigOperation_ReluctorUniversal2x);