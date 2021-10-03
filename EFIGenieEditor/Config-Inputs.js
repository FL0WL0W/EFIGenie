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

PinOuts = {
    STM32F103C: { 
        Name: "Blue pill: STM32F103C",
        Overlay: "images/STM32F103C_Overlay.png",
        OverlayWidth: 844,
        OverlayElementHeight: 24,
        Pins: [
            { Name: "PC_13", Value: (16*2 + 13), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 174, Align: "right"},
            { Name: "PC_14", Value: (16*2 + 14), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 200, Align: "right"},
            { Name: "PC_15", Value: (16*2 + 15), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 226, Align: "right"},
            { Name: "PA_0",  Value: (16*0 + 0 ), Digital: true , Analog: true , PWM: false, OverlayX: 844, OverlayY: 252, Align: "right"},
            { Name: "PA_1",  Value: (16*0 + 1 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 278, Align: "right"},
            { Name: "PA_2",  Value: (16*0 + 2 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 304, Align: "right"},
            { Name: "PA_3",  Value: (16*0 + 3 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 330, Align: "right"},
            { Name: "PA_4",  Value: (16*0 + 4 ), Digital: true , Analog: true , PWM: false, OverlayX: 844, OverlayY: 356, Align: "right"},
            { Name: "PA_5",  Value: (16*0 + 5 ), Digital: true , Analog: true , PWM: false, OverlayX: 844, OverlayY: 382, Align: "right"},
            { Name: "PA_6",  Value: (16*0 + 6 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 408, Align: "right"},
            { Name: "PA_7",  Value: (16*0 + 7 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 434, Align: "right"},
            { Name: "PB_0",  Value: (16*1 + 0 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 460, Align: "right"},
            { Name: "PB_1",  Value: (16*1 + 1 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 486, Align: "right"},
            { Name: "PB_10", Value: (16*1 + 10), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 512, Align: "right"},
            { Name: "PB_11", Value: (16*1 + 11), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 538, Align: "right"},
            { Name: "PB_9 ", Value: (16*1 + 9 ), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 226, Align: "left"},
            { Name: "PB_8 ", Value: (16*1 + 8 ), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 252, Align: "left"},
            { Name: "PB_7 ", Value: (16*1 + 7 ), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 278, Align: "left"},
            { Name: "PB_6 ", Value: (16*1 + 6 ), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 304, Align: "left"},
            { Name: "PB_5 ", Value: (16*1 + 5 ), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 330, Align: "left"},
            { Name: "PB_4 ", Value: (16*1 + 4 ), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 356, Align: "left"},
            { Name: "PB_3 ", Value: (16*1 + 3 ), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 382, Align: "left"},
            { Name: "PA_15", Value: (16*0 + 15), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 408, Align: "left"},
            { Name: "PA_12", Value: (16*0 + 12), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 434, Align: "left"},
            { Name: "PA_11", Value: (16*0 + 11), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 460, Align: "left"},
            { Name: "PA_10", Value: (16*0 + 10), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 486, Align: "left"},
            { Name: "PA_9 ", Value: (16*0 + 9 ), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 512, Align: "left"},
            { Name: "PA_8 ", Value: (16*0 + 8 ), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 538, Align: "left"},
            { Name: "PB_15", Value: (16*1 + 15), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 564, Align: "left"},
            { Name: "PB_14", Value: (16*1 + 14), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 590, Align: "left"},
            { Name: "PB_13", Value: (16*1 + 13), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 616, Align: "left"},
            { Name: "PB_12", Value: (16*1 + 12), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 642, Align: "left"},
        ]
    },
    STM32F401C : { 
        Name: "Black pill: STM32F401C/STM32F411C",
        Overlay: "images/STM32F401C_Overlay.png",
        OverlayWidth: 577,
        OverlayElementHeight: 22,
        Pins: [
            { Name: "PC_13", Value: (16*2 + 13), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 132, Align: "right"},
            { Name: "PC_14", Value: (16*2 + 14), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 154, Align: "right"},
            { Name: "PC_15", Value: (16*2 + 15), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 176, Align: "right"},
            { Name: "PA_0",  Value: (16*0 + 0 ), Digital: true , Analog: true , PWM: false, OverlayX: 577, OverlayY: 220, Align: "right"},
            { Name: "PA_1",  Value: (16*0 + 1 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 242, Align: "right"},
            { Name: "PA_2",  Value: (16*0 + 2 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 264, Align: "right"},
            { Name: "PA_3",  Value: (16*0 + 3 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 286, Align: "right"},
            { Name: "PA_4",  Value: (16*0 + 4 ), Digital: true , Analog: true , PWM: false, OverlayX: 577, OverlayY: 308, Align: "right"},
            { Name: "PA_5",  Value: (16*0 + 5 ), Digital: true , Analog: true , PWM: false, OverlayX: 577, OverlayY: 330, Align: "right"},
            { Name: "PA_6",  Value: (16*0 + 6 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 352, Align: "right"},
            { Name: "PA_7",  Value: (16*0 + 7 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 374, Align: "right"},
            { Name: "PB_0",  Value: (16*1 + 0 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 396, Align: "right"},
            { Name: "PB_1",  Value: (16*1 + 1 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 418, Align: "right"},
            { Name: "PB_2",  Value: (16*1 + 2 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 440, Align: "right"},
            { Name: "PB_10", Value: (16*1 + 10), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 462, Align: "right"},
            { Name: "PB_9 ", Value: (16*1 + 9 ), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 176, Align: "left"},
            { Name: "PB_8 ", Value: (16*1 + 8 ), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 198, Align: "left"},
            { Name: "PB_7 ", Value: (16*1 + 7 ), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 220, Align: "left"},
            { Name: "PB_6 ", Value: (16*1 + 6 ), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 242, Align: "left"},
            { Name: "PB_5 ", Value: (16*1 + 5 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 264, Align: "left"},
            { Name: "PB_4 ", Value: (16*1 + 4 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 286, Align: "left"},
            { Name: "PB_3 ", Value: (16*1 + 3 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 308, Align: "left"},
            { Name: "PA_15", Value: (16*0 + 15), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 330, Align: "left"},
            { Name: "PA_12", Value: (16*0 + 12), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 352, Align: "left"},
            { Name: "PA_11", Value: (16*0 + 11), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 374, Align: "left"},
            { Name: "PA_10", Value: (16*0 + 10), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 396, Align: "left"},
            { Name: "PA_9 ", Value: (16*0 + 9 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 418, Align: "left"},
            { Name: "PA_8 ", Value: (16*0 + 8 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 440, Align: "left"},
            { Name: "PB_15", Value: (16*1 + 15), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 462, Align: "left"},
            { Name: "PB_14", Value: (16*1 + 14), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 484, Align: "left"},
            { Name: "PB_13", Value: (16*1 + 13), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 506, Align: "left"},
            { Name: "PB_12", Value: (16*1 + 12), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 528, Align: "left"},
        ]
    }
};

var PinOut = PinOuts.STM32F103C;

function ParsePinSelectElements(pinSelectElements){
    var elements = [];
    if(pinSelectElements) {
        for(var i=0; i<pinSelectElements.length; i++) {
            elements.push({
                name: GetNameFromPinSelectElement(pinSelectElements[i]),
                digital: pinSelectElements[i].classList.contains("digital"),
                analog: pinSelectElements[i].classList.contains("analog"),
                pwm: pinSelectElements[i].classList.contains("pwm"),
                pin: $(pinSelectElements[i]).val()
            });
        }
    }
    return elements;
}

function GetNameFromPinSelectElement(element){
    var inputName = $($($(element).parent().parent().parent().parent().parent().parent().children()[0]).children()[1]).val();
    if(inputName)
        return inputName;

    var outputName = $($($($(element).parent().parent().parent().parent().children()[0]).children()[0]).children()[0]).text();
    if(outputName)
        return outputName;

    return "unknown";
}

function GenerateOverlay() {
    var pinSelectElements = ParsePinSelectElements($(".pinselect"));
    var ret = "<div style=\"width: " + PinOut.OverlayWidth + "; margin: auto; position: relative;\"><img src=\"" + PinOut.Overlay + "\"></img>";
    for(var i = 0; i < PinOut.Pins.length; i++) {
        var selectCount = 0;
        var sel = "";
        var endsel = "";
        for(var s=0; s<pinSelectElements.length; s++) {
            var selected = false;
            if(pinSelectElements[s].pin == PinOut.Pins[i].Value) {
                selectCount++;
                selected = true;
            }
            if( (pinSelectElements[s].digital && !PinOut.Pins[i].Digital) ||
                (pinSelectElements[s].analog && !PinOut.Pins[i].Analog) ||
                (pinSelectElements[s].pwm && !PinOut.Pins[i].PWM)) {
                endsel += "<option value=\"" + pinSelectElements[s].name + "\"" + (selected? " class=\"incompatible\" selected" : "") + " disabled>" + pinSelectElements[s].name + "</option>";  
            } else {
                sel += "<option value=\"" + pinSelectElements[s].name + "\"" + (selected? " selected" : "")+ ">" + pinSelectElements[s].name + "</option>";            
            }
                
        }
        if(selectCount > 1)
        {
            sel = sel.replaceAll("selected", "class=\"pinconflict\"");
            endsel = endsel.replaceAll("\" selected", " pinconflict\"");
        }
        sel += endsel;
        sel = "<select class=\"gpiooverlayselect" + (selectCount > 1? " pinconflict" : "") + "\" data-pin=\"" + PinOut.Pins[i].Value + "\" style=\""+
            "; height: " + PinOut.OverlayElementHeight + 
            "; top: " + (PinOut.Pins[i].OverlayY - PinOut.OverlayElementHeight / 2) + 
            "; " + PinOut.Pins[i].Align + ": " + PinOut.Pins[i].OverlayX + ";\">" +
            "<option value=\"\" disabled " + (selectCount != 1? "selected" : "")+ ">select</option>" + sel + "</select>";

        ret += sel;
    }
    return ret + "</div>";
}

function UpdatePinout(callingGUID, callingPin) {
    var pinSelectElements = $(".pinselect");
    if(pinSelectElements) {
        for(var i=0; i<pinSelectElements.length; i++) {
            var je = $(pinSelectElements[i]);
            var id = je.attr('id');
            var GUID = id.substring(0, id.length - 4);
            var pin = parseInt(je.val());
            if(GUID === callingGUID)
                pin = callingPin;
            je.replaceWith(GeneratePinList(GUID, pin, pinSelectElements[i].classList.contains("digital"), pinSelectElements[i].classList.contains("analog"), pinSelectElements[i].classList.contains("pwm")));
        }
    }

    //replace overlay
    $(".gpiooverlay").html(GenerateOverlay());
}

function GeneratePinList(GUID, pin, digital, analog, pwm) {

    var sel = "<option value=\"65535\" disabled " + (pin === 0xFFFF? "selected" : "")+ ">select</option>";
    var endsel = "";
    var pinConflict = false;
    var pinSelectElements = ParsePinSelectElements($(".pinselect").not("#" + GUID + "-pin"));
    for(var i = 0; i < PinOut.Pins.length; i++) {
        var selected = false;
        if(pin === PinOut.Pins[i].Value) {
            selected = true;
        }
        var name = "";
        for(var s=0; s<pinSelectElements.length; s++) {
            if(pin == pinSelectElements[s].pin){
                pinConflict  = true;
            }
            if(PinOut.Pins[i].Value == pinSelectElements[s].pin){
                name += ", " + pinSelectElements[s].name;
            }
        }
        name = PinOut.Pins[i].Name + (name != ""? ("(" + name.substring(2) + ")") : "");
        if( (digital && !PinOut.Pins[i].Digital) ||
            (analog && !PinOut.Pins[i].Analog) ||
            (pwm && !PinOut.Pins[i].PWM)) {
            endsel += "<option value=\"" + PinOut.Pins[i].Value + "\"" + (selected? (" class=\"incompatible\"" + " selected") : "") + " disabled>" + name + "</option>";
        } else {
            sel += "<option value=\"" + PinOut.Pins[i].Value + "\"" + (selected? " selected" : "")+ ">" + name + "</option>";
        }
    }
    sel += endsel;

    var ret = "<select id=\"" + GUID + "-pin\" class=\"pinselect ";
    if(analog)
        ret += "analog";
    else if(digital)
        ret += "digital";
    else if(pwm)
        ret += "pwm";
    ret += (pinConflict? " pinconflict" : "") + "\">" + sel + "</select>";
    return ret
}

class ConfigInputs {
    static Template = getFileContents("ConfigGui/Inputs.html");

    constructor(){
        this.GUID = getGUID();
    }

    Inputs = [new ConfigInput()];
    TargetDevice = "STM32F401C";
    Selected = 0;

    GetObj() {
        var obj  = { Inputs: [], TargetDevice: this.TargetDevice };

        for(var i = 0; i < this.Inputs.length; i++){
            obj.Inputs.push(this.Inputs[i].GetObj());
        }

        return obj;
    }

    SetObj(obj) {
        this.Detach();
        this.Inputs = [];

        if(obj) {
            if(obj.TargetDevice) {
                this.TargetDevice = obj.TargetDevice;
                PinOut = PinOuts[this.TargetDevice];
            }
            if(obj.Inputs){
                for(var i = 0; i < obj.Inputs.length; i++){
                    this.Inputs.push(new ConfigInput());
                    this.Inputs[i].SetObj(obj.Inputs[i]);
                }
            }
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        for(var i = 0; i < this.Inputs.length; i++){
            this.Inputs[i].Detach();
        }

        $(document).off("change."+this.GUID);
        $(document).off("click."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        for(var i = 0; i < this.Inputs.length; i++){
            this.Inputs[i].Attach();
        }

        $(document).on("change."+this.GUID, ".gpiooverlayselect", function(){
            var selected = $(this).val();

            var pinSelectElements = $(".pinselect");
            if(pinSelectElements) {
                for(var i=0; i<pinSelectElements.length; i++) {
                    var name = GetNameFromPinSelectElement(pinSelectElements[i]);
                    if(selected == name)
                    {
                        $(pinSelectElements[i]).val($(this).data("pin"));
                        $(pinSelectElements[i]).trigger("change");
                    }
                }
            }
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-inputs a", function(){
            var selected = parseInt($(this).data("index"));
            if(isNaN(selected))
                return;

            thisClass.Selected = selected;

            $("#"+ thisClass.GUID + " .inputconfig").hide();
            $("#"+ thisClass.GUID + "-" + thisClass.Selected).show();

            //this doesn't work for some reason
            // $("#" + this.GUID + "-inputs a").removeClass("active");
            // $(this).addClass("active");
            //so nuking it instead
            $("#" + thisClass.GUID + "-inputs").replaceWith(thisClass.GetInputsHtml());
        });
        
        $(document).on("change."+this.GUID, "#" + this.GUID + "-name", function(){
            if(isNaN(thisClass.Selected))
                return;

            thisClass.Inputs[thisClass.Selected].Name = $(this).val();
            $("#" + thisClass.GUID + "-inputs").replaceWith(thisClass.GetInputsHtml());
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Add", function(){
            thisClass.Inputs.push(new ConfigInput());
            $("#" + thisClass.GUID + "-inputs").replaceWith(thisClass.GetInputsHtml());
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Delete", function(){
            if(isNaN(thisClass.Selected))
                return;
            
            thisClass.Inputs.splice(thisClass.Selected, 1);
            $("#" + thisClass.GUID + "-inputs").replaceWith(thisClass.GetInputsHtml());
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Up", function(){
            if(isNaN(thisClass.Selected) || thisClass.Selected === 0)
                return;
            
            var temp = thisClass.Inputs[thisClass.Selected];
            thisClass.Inputs[thisClass.Selected] = thisClass.Inputs[thisClass.Selected - 1];
            thisClass.Inputs[thisClass.Selected - 1] = temp;
            thisClass.Selected -= 1;
            $("#" + thisClass.GUID + "-inputs").replaceWith(thisClass.GetInputsHtml());
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Down", function(){
            if(isNaN(thisClass.Selected) || thisClass.Selected === thisClass.Inputs.length-1)
                return;
            
            var temp = thisClass.Inputs[thisClass.Selected];
            thisClass.Inputs[thisClass.Selected] = thisClass.Inputs[thisClass.Selected + 1];
            thisClass.Inputs[thisClass.Selected + 1] = temp;
            thisClass.Selected += 1;
            $("#" + thisClass.GUID + "-inputs").replaceWith(thisClass.GetInputsHtml());
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Duplicate", function(){
            if(isNaN(thisClass.Selected))
                return;
            
            thisClass.Inputs.push(new ConfigInput());
            thisClass.Inputs[thisClass.Inputs.length-1].SetObj(thisClass.Inputs[thisClass.Selected].GetObj());
            thisClass.Selected = thisClass.Inputs.length-1;
            $("#" + thisClass.GUID + "-inputs").replaceWith(thisClass.GetInputsHtml());
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
    }

    GetInputsHtml() {
        if(isNaN(this.Selected))
            this.Selected = 0;

        var inputlist = "";
        for(var i = 0; i < this.Inputs.length; i++){
            inputlist += "<a href=\"#\" data-index=\"" + i + "\" class=\"w3-bar-subitem w3-button" + (this.Selected === i? " active" : "") + "\">" + this.Inputs[i].Name + "</a>";
        }
        return "<div id=\"" + this.GUID + "-inputs\">" + inputlist + "</div>";
    }

    GetControlsHtml() {
        return  "<span id=\"" + this.GUID + "-Add\" style=\"padding: 3px 7px;\">+</span>" +
                "<span id=\"" + this.GUID + "-Delete\" style=\"padding: 3px 8px;\">-</span>" +
                "<span id=\"" + this.GUID + "-Up\" style=\"padding: 3px 4px;\">↑</span>" +
                "<span id=\"" + this.GUID + "-Down\" style=\"padding: 3px 4px;\">↓</span>" +
                "<span id=\"" + this.GUID + "-Duplicate\" style=\"padding: 3px 7px;\">+</span>";
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        
        if(isNaN(this.Selected))
            this.Selected = 0;

        var configs = "";
        for(var i = 0; i < this.Inputs.length; i++)
        {
            configs += "<div id=\""+this.GUID+"-"+i+"\" class=\"inputconfig\" " + (i===this.Selected? "" : "style=\"display: none;\"") + "><div  class=\"configContainer\" style=\"border-style: none;\">" +
            "    <label for=\""+this.GUID+"-name\">Name:</label>" +
            "    <input id=\""+this.GUID+"-name\" type=\"text\" value=\"" + this.Inputs[i].Name + "\"/>" +
            "</div>" +
            "   <div class=\"configContainer\">" + 
            this.Inputs[i].GetHtml() +
            "</div></div>";
        }

        template = template.replace(/[$]inputconfig[$]/g, configs);
        template = template.replace(/[$]overlay[$]/g, GenerateOverlay());

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
        this.Detach();
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
            thisClass.TranslationMeasurement = $(this).val();
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

    Pin = 0xFFFF;

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
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Pin = parseInt($(this).val());
            UpdatePinout(thisClass.GUID, thisClass.Pin);
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, GeneratePinList(this.GUID, this.Pin, false, true, false));

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
    
    Pin = 0xFFFF;
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
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Pin = parseInt($(this).val());
            UpdatePinout(thisClass.GUID, thisClass.Pin);
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-inverted", function(){
            thisClass.Inverted = this.checked? 1 : 0;
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, GeneratePinList(this.GUID, this.Pin, true, false, false));
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
    
    Pin = 0xFFFF;
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
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Pin = parseInt($(this).val());
            UpdatePinout(thisClass.GUID, thisClass.Pin);
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-inverted", function(){
            thisClass.Inverted = this.checked? 1 : 0;
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-length", function(){
            thisClass.Length = parseInt($(this).val());
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, GeneratePinList(this.GUID, this.Pin, true, false, false));
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
    
    Pin = 0xFFFF;
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
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Pin = parseInt($(this).val());
            UpdatePinout(thisClass.GUID, thisClass.Pin);
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-minFrequency", function(){
            thisClass.MinFrequency = parseInt($(this).val());
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, GeneratePinList(this.GUID, this.Pin, false, false, true));
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
    
    Pin = 0xFFFF;
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
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Pin = parseInt($(this).val());
            UpdatePinout(thisClass.GUID, thisClass.Pin);
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-minFrequency", function(){
            thisClass.MinFrequency = parseInt($(this).val());
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, GeneratePinList(this.GUID, this.Pin, false, false, true));
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
    
    Pin = 0xFFFF;
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
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-pin", function(){
            thisClass.Pin = parseInt($(this).val());
            UpdatePinout(thisClass.GUID, thisClass.Pin);
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-minFrequency", function(){
            thisClass.MinFrequency = parseInt($(this).val());
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]pin[$]/g, GeneratePinList(this.GUID, this.Pin, false, false, true));
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
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-min", function(){
            thisClass.MinValue = parseFloat($(this).val());
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-max", function(){
            thisClass.MaxValue = parseFloat($(this).val());
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-degree", function(){
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
        });
        
        $(document).on("change."+this.GUID, "#" + this.GUID + "-A", function(){
            var index = $(this).data("index");
            var val = parseFloat($(this).val());

            thisClass.A[index] = val;
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
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-rising", function(){
            thisClass.RisingPosition = parseFloat($(this).val());
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-falling", function(){
            thisClass.FallingPosition = parseFloat($(this).val());
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
        this.Attach();
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-firstToothPosition", function(){
            thisClass.FirstToothPosition = parseFloat($(this).val());
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-toothWidth", function(){
            thisClass.ToothWidth = parseFloat($(this).val());
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-numberOfTeeth", function(){
            thisClass.NumberOfTeeth = parseInt($(this).val());
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-numberOfTeethMissing", function(){
            thisClass.NumberOfTeethMissing = parseInt($(this).val());
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