var CurrentTickVariableID = 0;
var InputConfigs = [];
InputConfigs.push(ConfigOperation_Static);
InputConfigs.push(ConfigOperation_LookupTable);

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
        Name: `Blue pill: STM32F103C`,
        Overlay: `images/STM32F103C_Overlay.png`,
        OverlayWidth: 844,
        OverlayElementHeight: 24,
        Pins: [
            { Name: `PC_13`, Value: (16*2 + 13), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 174, Align: `right`},
            { Name: `PC_14`, Value: (16*2 + 14), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 200, Align: `right`},
            { Name: `PC_15`, Value: (16*2 + 15), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 226, Align: `right`},
            { Name: `PA_0`,  Value: (16*0 + 0 ), Digital: true , Analog: true , PWM: false, OverlayX: 844, OverlayY: 252, Align: `right`},
            { Name: `PA_1`,  Value: (16*0 + 1 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 278, Align: `right`},
            { Name: `PA_2`,  Value: (16*0 + 2 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 304, Align: `right`},
            { Name: `PA_3`,  Value: (16*0 + 3 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 330, Align: `right`},
            { Name: `PA_4`,  Value: (16*0 + 4 ), Digital: true , Analog: true , PWM: false, OverlayX: 844, OverlayY: 356, Align: `right`},
            { Name: `PA_5`,  Value: (16*0 + 5 ), Digital: true , Analog: true , PWM: false, OverlayX: 844, OverlayY: 382, Align: `right`},
            { Name: `PA_6`,  Value: (16*0 + 6 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 408, Align: `right`},
            { Name: `PA_7`,  Value: (16*0 + 7 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 434, Align: `right`},
            { Name: `PB_0`,  Value: (16*1 + 0 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 460, Align: `right`},
            { Name: `PB_1`,  Value: (16*1 + 1 ), Digital: true , Analog: true , PWM: true , OverlayX: 844, OverlayY: 486, Align: `right`},
            { Name: `PB_10`, Value: (16*1 + 10), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 512, Align: `right`},
            { Name: `PB_11`, Value: (16*1 + 11), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 538, Align: `right`},
            { Name: `PB_9`,  Value: (16*1 + 9 ), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 226, Align: `left`},
            { Name: `PB_8`,  Value: (16*1 + 8 ), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 252, Align: `left`},
            { Name: `PB_7`,  Value: (16*1 + 7 ), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 278, Align: `left`},
            { Name: `PB_6`,  Value: (16*1 + 6 ), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 304, Align: `left`},
            { Name: `PB_5`,  Value: (16*1 + 5 ), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 330, Align: `left`},
            { Name: `PB_4`,  Value: (16*1 + 4 ), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 356, Align: `left`},
            { Name: `PB_3`,  Value: (16*1 + 3 ), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 382, Align: `left`},
            { Name: `PA_15`, Value: (16*0 + 15), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 408, Align: `left`},
            { Name: `PA_12`, Value: (16*0 + 12), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 434, Align: `left`},
            { Name: `PA_11`, Value: (16*0 + 11), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 460, Align: `left`},
            { Name: `PA_10`, Value: (16*0 + 10), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 486, Align: `left`},
            { Name: `PA_9`,  Value: (16*0 + 9 ), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 512, Align: `left`},
            { Name: `PA_8`,  Value: (16*0 + 8 ), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 538, Align: `left`},
            { Name: `PB_15`, Value: (16*1 + 15), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 564, Align: `left`},
            { Name: `PB_14`, Value: (16*1 + 14), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 590, Align: `left`},
            { Name: `PB_13`, Value: (16*1 + 13), Digital: true , Analog: false, PWM: true , OverlayX: 844, OverlayY: 616, Align: `left`},
            { Name: `PB_12`, Value: (16*1 + 12), Digital: true , Analog: false, PWM: false, OverlayX: 844, OverlayY: 642, Align: `left`},
        ]
    },
    STM32F401C : { 
        Name: `Black pill: STM32F401C/STM32F411C`,
        Overlay: `images/STM32F401C_Overlay.png`,
        OverlayWidth: 577,
        OverlayElementHeight: 22,
        Pins: [
            { Name: `PC_13`, Value: (16*2 + 13), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 132, Align: `right`},
            { Name: `PC_14`, Value: (16*2 + 14), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 154, Align: `right`},
            { Name: `PC_15`, Value: (16*2 + 15), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 176, Align: `right`},
            { Name: `PA_0`,  Value: (16*0 + 0 ), Digital: true , Analog: true , PWM: false, OverlayX: 577, OverlayY: 220, Align: `right`},
            { Name: `PA_1`,  Value: (16*0 + 1 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 242, Align: `right`},
            { Name: `PA_2`,  Value: (16*0 + 2 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 264, Align: `right`},
            { Name: `PA_3`,  Value: (16*0 + 3 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 286, Align: `right`},
            { Name: `PA_4`,  Value: (16*0 + 4 ), Digital: true , Analog: true , PWM: false, OverlayX: 577, OverlayY: 308, Align: `right`},
            { Name: `PA_5`,  Value: (16*0 + 5 ), Digital: true , Analog: true , PWM: false, OverlayX: 577, OverlayY: 330, Align: `right`},
            { Name: `PA_6`,  Value: (16*0 + 6 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 352, Align: `right`},
            { Name: `PA_7`,  Value: (16*0 + 7 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 374, Align: `right`},
            { Name: `PB_0`,  Value: (16*1 + 0 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 396, Align: `right`},
            { Name: `PB_1`,  Value: (16*1 + 1 ), Digital: true , Analog: true , PWM: true , OverlayX: 577, OverlayY: 418, Align: `right`},
            { Name: `PB_2`,  Value: (16*1 + 2 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 440, Align: `right`},
            { Name: `PB_10`, Value: (16*1 + 10), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 462, Align: `right`},
            { Name: `PB_9`,  Value: (16*1 + 9 ), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 176, Align: `left`},
            { Name: `PB_8`,  Value: (16*1 + 8 ), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 198, Align: `left`},
            { Name: `PB_7`,  Value: (16*1 + 7 ), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 220, Align: `left`},
            { Name: `PB_6`,  Value: (16*1 + 6 ), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 242, Align: `left`},
            { Name: `PB_5`,  Value: (16*1 + 5 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 264, Align: `left`},
            { Name: `PB_4`,  Value: (16*1 + 4 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 286, Align: `left`},
            { Name: `PB_3`,  Value: (16*1 + 3 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 308, Align: `left`},
            { Name: `PA_15`, Value: (16*0 + 15), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 330, Align: `left`},
            { Name: `PA_12`, Value: (16*0 + 12), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 352, Align: `left`},
            { Name: `PA_11`, Value: (16*0 + 11), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 374, Align: `left`},
            { Name: `PA_10`, Value: (16*0 + 10), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 396, Align: `left`},
            { Name: `PA_9`,  Value: (16*0 + 9 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 418, Align: `left`},
            { Name: `PA_8`,  Value: (16*0 + 8 ), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 440, Align: `left`},
            { Name: `PB_15`, Value: (16*1 + 15), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 462, Align: `left`},
            { Name: `PB_14`, Value: (16*1 + 14), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 484, Align: `left`},
            { Name: `PB_13`, Value: (16*1 + 13), Digital: true , Analog: false, PWM: true , OverlayX: 577, OverlayY: 506, Align: `left`},
            { Name: `PB_12`, Value: (16*1 + 12), Digital: true , Analog: false, PWM: false, OverlayX: 577, OverlayY: 528, Align: `left`},
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
                digital: pinSelectElements[i].classList.contains(`digital`),
                analog: pinSelectElements[i].classList.contains(`analog`),
                pwm: pinSelectElements[i].classList.contains(`pwm`),
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

    return `unknown`;
}

//The overlay is a bit of a javascript hack, but it works well so I'm not changing it.
function GenerateOverlay() {
    var pinSelectElements = ParsePinSelectElements($(`.pinselect`));
    var ret = `<div style="width: ${PinOut.OverlayWidth}; margin: auto; position: relative;"><img src="${PinOut.Overlay}"></img>`;
    for(var i = 0; i < PinOut.Pins.length; i++) {
        var selectCount = 0;
        var sel = ``;
        var endsel = ``;
        for(var s=0; s<pinSelectElements.length; s++) {
            var selected = false;
            if(pinSelectElements[s].pin == PinOut.Pins[i].Value) {
                selectCount++;
                selected = true;
            }
            if( (pinSelectElements[s].digital && !PinOut.Pins[i].Digital) ||
                (pinSelectElements[s].analog && !PinOut.Pins[i].Analog) ||
                (pinSelectElements[s].pwm && !PinOut.Pins[i].PWM)) {
                endsel += `<option value="${pinSelectElements[s].name}"${selected? ` class="incompatible" selected` : ``} disabled>${pinSelectElements[s].name}</option>`;
            } else {
                sel += `<option value="${pinSelectElements[s].name}"${selected? ` selected` : ``}>${pinSelectElements[s].name}</option>`;            
            }
                
        }
        if(selectCount > 1)
        {
            sel = sel.replaceAll(`selected`, `class="pinconflict"`);
            endsel = endsel.replaceAll(`" selected`, ` pinconflict"`);
        }
        sel += endsel;
        sel = `<select class="gpiooverlayselect${selectCount > 1? ` pinconflict` : ``}" data-pin="${PinOut.Pins[i].Value}" style="` +
            `; height: ${PinOut.OverlayElementHeight}` + 
            `; top: ${PinOut.Pins[i].OverlayY - PinOut.OverlayElementHeight / 2}`+ 
            `; ${PinOut.Pins[i].Align}: ${PinOut.Pins[i].OverlayX};">` +
            `<option value="" disabled ${selectCount != 1? `selected` : ``}>select</option>${sel}</select>`;

        ret += sel;
    }
    return `${ret}</div>`;
}

function UpdateOverlay() {
    $(`.gpiooverlay`).html(GenerateOverlay());
}

//if any changes are needed in ConfigInputs, refactor to use UITemplate
class ConfigInputs {
    static Template = getFileContents(`ConfigGui/Inputs.html`);

    constructor(){
        this.GUID = generateGUID();
        this.Inputs = [this.NewInput()];
    }

    TargetDevice = `STM32F401C`;
    Selected = 0;
    ContextSelect;

    NewInput() {
        const thisClass = this;
        return new ConfigInput({
            OnChange: function() {$(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());}
        });
    }

    GetValue() {
        var value  = { Inputs: [], TargetDevice: this.TargetDevice };

        for(var i = 0; i < this.Inputs.length; i++){
            value.Inputs.push(this.Inputs[i].GetValue());
        }

        return value;
    }

    SetValue(value) {
        this.Detach();

        if(value) {
            if(value.TargetDevice) {
                this.TargetDevice = value.TargetDevice;
                PinOut = PinOuts[this.TargetDevice];
            }
            else if(!value.Inputs) {
                value = { Inputs: value };
            }

            for(var i = 0; i < value.Inputs.length; i++){
                if(i >= this.Inputs.length)
                    this.Inputs.push(this.NewInput());
                this.Inputs[i].SetValue(value.Inputs[i]);
            }
            this.Inputs = this.Inputs.slice(0, value.Inputs.length)
        }

        $(`#${this.GUID}`).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        for(var i = 0; i < this.Inputs.length; i++){
            this.Inputs[i].Detach();
        }

        $(document).off(`contextmenu.${this.GUID}`);
        $(document).off(`change.${this.GUID}`);
        $(document).off(`click.${this.GUID}`);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        for(var i = 0; i < this.Inputs.length; i++){
            this.Inputs[i].Attach();
        }

        $(document).on(`change.${this.GUID}`, `.gpiooverlayselect`, function(){
            var selected = $(this).val();

            var pinSelectElements = $(`.pinselect`);
            if(pinSelectElements) {
                for(var i=0; i<pinSelectElements.length; i++) {
                    var name = GetNameFromPinSelectElement(pinSelectElements[i]);
                    if(selected == name)
                    {
                        $(pinSelectElements[i]).val($(this).data(`pin`));
                        $(pinSelectElements[i]).trigger(`change`);
                    }
                }
            }
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID}-inputs div`, function(){
            var selected = parseInt($(this).data(`index`));
            if(isNaN(selected))
                return;

            thisClass.Selected = selected;

            $(`#${thisClass.GUID} .inputconfig`).hide();
            $(`#${thisClass.GUID}-${thisClass.Selected}`).show();

            //this doesn't work for some reason
            // $(`#${this.GUID}-inputs a`).removeClass(`active`);
            // $(this).addClass(`active`);
            //so nuking it instead
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
        });
                
        $(document).on(`contextmenu.${this.GUID}`, `#${this.GUID}-inputs div`, function(e){
            $(`#${thisClass.GUID}-contextmenu`).show();
            $(`#${thisClass.GUID}-contextmenu`).css(`left`, `${e.pageX}px`);
            $(`#${thisClass.GUID}-contextmenu`).css(`top` , `${e.pageY}px`);
            thisClass.ContextSelect = $(this).data(`index`);
            
            e.preventDefault();
        });
        $(document).on(`click.${this.GUID}`, function(){
            $(`#${thisClass.GUID}-contextmenu`).hide();
        });

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-add`, function(){
            if(isNaN(thisClass.ContextSelect))
                return;

            thisClass.Inputs.splice(thisClass.ContextSelect + 1, 0, this.NewInput());
            thisClass.Selected = thisClass.ContextSelect + 1;
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID}-delete`, function(){
            if(isNaN(thisClass.ContextSelect))
                return;
            
            thisClass.Inputs.splice(thisClass.ContextSelect, 1);
            if(thisClass.ContextSelect <= thisClass.Selected && thisClass.Selected !== 0)
                thisClass.Selected--;
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-duplicate`, function(){
            if(isNaN(thisClass.ContextSelect))
                return;
            
            thisClass.Inputs.push(this.NewInput());
            thisClass.Inputs[thisClass.Inputs.length-1].SetValue(thisClass.Inputs[contextSelect].GetValue());
            thisClass.Selected = thisClass.Inputs.length-1;
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID}-Up`, function(){
            if(isNaN(thisClass.Selected) || thisClass.Selected === 0)
                return;
            
            var temp = thisClass.Inputs[thisClass.Selected];
            thisClass.Inputs[thisClass.Selected] = thisClass.Inputs[thisClass.Selected - 1];
            thisClass.Inputs[thisClass.Selected - 1] = temp;
            thisClass.Selected -= 1;
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID}-Down`, function(){
            if(isNaN(thisClass.Selected) || thisClass.Selected === thisClass.Inputs.length-1)
                return;
            
            var temp = thisClass.Inputs[thisClass.Selected];
            thisClass.Inputs[thisClass.Selected] = thisClass.Inputs[thisClass.Selected + 1];
            thisClass.Inputs[thisClass.Selected + 1] = temp;
            thisClass.Selected += 1;
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
    }

    GetInputsHtml() {
        if(isNaN(this.Selected))
            this.Selected = 0;

        var inputlist = ``;
        for(var i = 0; i < this.Inputs.length; i++){
            var liveUpdate = this.Inputs[i].TranslationConfig.LiveUpdate;
            if(!this.Inputs[i].TranslationConfig.Selection.Value)
                liveUpdate = this.Inputs[i].RawConfig.LiveUpdate;
            inputlist += `<div data-index="${i}" class="w3-bar-subitem w3-button${this.Selected === i? ` active` : ``}">${this.Inputs[i].Name.Value}<span style="float: right;">${liveUpdate.GetHtml()}</span></div>`;
        }
        if(this.Inputs.length === 0){
            this.ContextSelect = -1;
            inputlist = `<div id="${this.GUID}-add" class="w3-bar-subitem w3-button"><span class="monospace">+ </span>Add</div>`;
        }
        return `<div id="${this.GUID}-inputs">${inputlist}</div>`;
    }

    GetControlsHtml() {
        return  `<span id="${this.GUID}-Up" style="padding: 3px 4px;">↑</span>` +
                `<span id="${this.GUID}-Down" style="padding: 3px 4px;">↓</span>`;
    }

    GetHtml() {
        var template = GetClassProperty(this, `Template`);

        template = template.replace(/[$]id[$]/g, this.GUID);
        
        if(isNaN(this.Selected))
            this.Selected = 0;

        var configs = ``;
        for(var i = 0; i < this.Inputs.length; i++)
        {
            configs += `<div id="${this.GUID}-${i}" class="inputconfig"${i===this.Selected? `` : ` style="display: none;"`}><div  class="configContainer" style="border-style: none;">` +
            `</div>` +
            `   <div class="configContainer">` + 
            this.Inputs[i].GetHtml() +
            `</div></div>`;
        }

        template = template.replace(/[$]inputconfig[$]/g, configs);
        template = template.replace(/[$]overlay[$]/g, GenerateOverlay());

        return template;
    }

    RegisterVariables() {
        for(var i = 0; i < this.Inputs.length; i++){
            this.Inputs[i].RegisterVariables();
        }
    }

    GetObjOperation() {
        var obj = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }, // Group
            { type: `UINT16`, value: this.Inputs.length + 1 }, // number of operations
            
            { 
                type: `Package`, //Package
                value: [{ type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.GetTick }], //GetTick factory ID
                outputVariables: [`CurrentTickId`]
            }
        ]};

        for(var i = 0; i < this.Inputs.length; i++){
            obj.value.push({ obj: this.Inputs[i].GetObjOperation()});
        }

        return obj;
    }
}

class ConfigInput extends UITemplate {
    static Template = `<div><label for="$Name.GUID$">Name:</label>$Name$</div>$RawConfig$<hr style="margin: 2px;"/>$TranslationConfig$`

    constructor(prop) {
        prop ??= {};
        prop.RawConfig = new ConfigOrVariableSelection({
            Configs:            InputConfigs,
            Label:              `Raw Input`,
            Inputs:             [],
            Name:               prop.Name,
            VariableListName:   `Inputs`,
        });
        prop.TranslationConfig = new ConfigOrVariableSelection({
            Configs:            InputConfigs,
            Label:              `Translation`,
            Inputs:             [``],
            Name:               prop.Name,
            VariableListName:   `Inputs`,
            Template: ConfigOrVariableSelection.Template.replace(`$Selection$`, `$Selection$ \\$TranslationMeasurement\\$`)
        });
        prop.Name = new UIText({
            Value: prop.Name ?? `Input`
        })
        const measurementKeys = Object.keys(Measurements)
        var options = [];
        measurementKeys.forEach(function(measurement) {options.push({Name: measurement, Value: measurement})});
        prop.TranslationMeasurement = new UISelection({
            Value: `None`,
            SelectNotVisible: true,
            Options: options,
        });
        super(prop);
        const thisClass = this;
        this.RawConfig.OnChange.push(function() { thisClass.TranslationConfig.Inputs = [GetClassProperty(thisClass.RawConfig.GetSubConfig(), `Output`)]; })
        this.Name.OnChange.push(function() { thisClass.TranslationConfig.Name = thisClass.RawConfig.Name = thisClass.Name.Value });
        this.TranslationMeasurement.OnChange.push(function() { thisClass.TranslationConfig.Measurement = thisClass.TranslationMeasurement.Value })
    }

    RegisterVariables() {
        this.TranslationConfig.RegisterVariables?.();
        this.RawConfig.RegisterVariables?.();
    }

    SetValue(value) {
        if(value?.RawConfig?.Name){
            value.RawConfig = {
                Values: [ value.RawConfig ],
                Selection: { value: value.RawConfig.Name }
            };
        }
        if(value?.TranslationConfig?.Name){
            value.TranslationConfig = {
                Values: [ value.TranslationConfig ],
                Selection: { value: value.TranslationConfig.Name }
            };
        }
        super.SetValue(value);
    }
}

class UIPinSelection extends UISelection {
    constructor(prop){
        super(prop);
        this.SelectDisabled = prop.SelectDisabled ?? true;
        this.SelectValue = prop.SelectValue ?? 0xFFFF;
        this.Class = !prop.Class? `${this.PinType} pinselect` : `${prop.Class} ${this.PinType} pinselect`;
        this.Options = this.GenerateOptionList();
        this.OnChange.push(function() {
            UpdateOverlay();
        })
    }

    GenerateOptionList() {
        var options = []
        var endOptions = [];
        for(var i = 0; i < PinOut.Pins.length; i++) {
            const selected = this.Value === PinOut.Pins[i].Value;
            if( (this.PinType === `digital` && !PinOut.Pins[i].Digital) ||
                (this.PinType === `analog` && !PinOut.Pins[i].Analog) ||
                (this.PinType === `pwm` && !PinOut.Pins[i].PWM)) {
                endOptions.push({
                    Name: PinOut.Pins[i].Name,
                    Value: PinOut.Pins[i].Value,
                    Selected: selected,
                    Class: selected? `incompatible` : undefined,
                    Disabled: true
                });
            } else {
                options.push({
                    Name: PinOut.Pins[i].Name,
                    Value: PinOut.Pins[i].Value,
                    Selected: selected
                });
            }
        }
        options = options.concat(endOptions);

        return options;
    }
}

class ConfigOperation_AnalogPinRead extends UITemplate {
    static Name = `Analog Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Voltage`;
    static Template =   `<div><label for="$Pin.GUID$">Pin:</label>$Pin$</div>`

    constructor(prop){
        prop ??= {};
        prop.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `analog`
        });
        super(prop);
    }

    GetObjOperation(outputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.AnalogInput}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
        ]};

        if (outputVariableId)
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ] 
            });

        return objOperation;
    }
}
InputConfigs.push(ConfigOperation_AnalogPinRead);

class ConfigOperation_DigitalPinRead extends UITemplate {
    static Name = `Digital Pin`;
    static Output = `bool`;
    static Inputs = [];
    static Measurement = ``;
    static Template =   `<div><label for="$Pin.GUID$">Pin:</label>$Pin$$Inverted$Inverted</div>`

    constructor(prop){
        prop ??= {};
        prop.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `digital`
        });
        prop.Inverted = new UICheckbox();
        super(prop);
    }

    GetObjOperation(outputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalInput}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `BOOL`, value: this.Inverted.Value}, //inverted
        ]};

        if (outputVariableId)
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ] 
            });

        return objOperation;
    }
}
InputConfigs.push(ConfigOperation_DigitalPinRead);

class ConfigOperation_DigitalPinRecord extends UITemplate {
    static Name = `Digital Pin (Record)`;
    static Output = `Record`;
    static Inputs = [];
    static Measurement = `Record`;
    static Template =   `<div><label for="$Pin.GUID$">Pin:</label>$Pin$$Inverted$Inverted</div>` +
                        `<div><label for="$Length.GUID$">Length:</label>$Length$</div>`;

    constructor(prop){
        prop ??= {};
        prop.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `digital`
        });
        prop.Inverted = new UICheckbox();
        prop.Length = new UINumber ({
            Value: 2,
            Step: 1,
            Min: 1,
            Max: 1000
        });
        super(prop);
    }

    GetObjOperation(outputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalPinRecord}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `BOOL`, value: this.Inverted.Value}, //inverted
            { type: `UINT16`, value: this.Length.Value}, //length
        ]};

        if (outputVariableId) 
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ] 
            });

        return objOperation;
    }
}
InputConfigs.push(ConfigOperation_DigitalPinRecord);

class ConfigOperation_DutyCyclePinRead extends UITemplate {
    static Name = `Duty Cycle Pin Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Percentage`;
    static Template =   `<div><label for="$Pin.GUID$">Pin:</label>$Pin$</div>` +
                        `<div><label for="$MinFrequency.GUID$">Minimum Frequency:</label>$MinFrequency$</div>`;

    constructor(prop){
        prop ??= {};
        prop.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `pwm`
        });
        prop.MinFrequency = new UINumberWithMeasurement({
            Value: 1000,
            Step: 1,
            Min: 0,
            Max: 65535,
            Measurement: `Frequency`
        });
        super(prop);
    }

    GetObjOperation(outputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DutyCyclePinRead}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `UINT16`, value: this.MinFrequency.Value}, //minFrequency
        ]};

        if (outputVariableId) 
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ] 
            });

        return objOperation;
    }
}
InputConfigs.push(ConfigOperation_DutyCyclePinRead);

class ConfigOperation_FrequencyPinRead extends UITemplate {
    static Name = `Frequency Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Frequency`;
    static Template =   `<div><label for="$Pin.GUID$">Pin:</label>$Pin$</div>` +
                        `<div><label for="$MinFrequency.GUID$">Minimum Frequency:</label>$MinFrequency$</div>`;

    constructor(prop){
        prop ??= {};
        prop.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `pwm`
        });
        prop.MinFrequency = new UINumberWithMeasurement({
            Value: 1000,
            Step: 1,
            Min: 0,
            Max: 65535,
            Measurement: `Frequency`
        });
        super(prop);
    }

    GetObjOperation(outputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.FrequencyPinRead}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `UINT16`, value: this.MinFrequency.Value}, //minFrequency
        ]};

        if (outputVariableId) 
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ] 
            });

        return objOperation;
    }
}
InputConfigs.push(ConfigOperation_FrequencyPinRead);

class ConfigOperation_PulseWidthPinRead extends UITemplate {
    static Name = `Pulse Width Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Time`;
    static Template =   `<div><label for="$Pin.GUID$">Pin:</label>$Pin$</div>` +
                        `<div><label for="$MinFrequency.GUID$">Minimum Frequency:</label>$MinFrequency$</div>`;

    constructor(prop){
        prop ??= {};
        prop.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `pwm`
        });
        prop.MinFrequency = new UINumberWithMeasurement({
            Value: 1000,
            Step: 1,
            Min: 0,
            Max: 65535,
            Measurement: `Frequency`
        });
        super(prop);
    }

    GetObjOperation(outputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.PulseWidthPinRead}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `UINT16`, value: this.MinFrequency.Value}, //minFrequency
        ]};

        if (outputVariableId) 
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ] 
            });

        return objOperation;
    }
}
InputConfigs.push(ConfigOperation_PulseWidthPinRead);

//this could be refactored to use UITemplate, but it works well and i forsee no changes needed so leaving as is
class ConfigOperation_Polynomial {
    static Name = `Polynomial`;
    static Output = `float`;
    static Inputs = [`float`];
    static Template = getFileContents(`ConfigGui/Operation_Polynomial.html`);

    constructor(){
        this.GUID = generateGUID();
    }
    
    MinValue = 0;
    MaxValue = 1;
    Degree = 3;
    A = [0, 0, 0];

    GetValue() {
        return { 
            Name: GetClassProperty(this, `Name`),
            MinValue: this.MinValue,
            MaxValue: this.MaxValue,
            Degree: this.Degree,
            A: this.A.slice()
        };
    }

    SetValue(value) {
        if(value) {
            this.MinValue = value.MinValue;
            this.MaxValue = value.MaxValue;
            this.Degree = value.Degree;
            this.A = value.A.slice();
        }
        $(`#${this.GUID}`).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        $(document).off(`change.${this.GUID}`);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on(`change.${this.GUID}`, `#${this.GUID}-min`, function(){
            thisClass.MinValue = parseFloat($(this).val());
        });

        $(document).on(`change.${this.GUID}`, `#${this.GUID}-max`, function(){
            thisClass.MaxValue = parseFloat($(this).val());
        });

        $(document).on(`change.${this.GUID}`, `#${this.GUID}-degree`, function(){
            thisClass.Degree = parseInt($(this).val());

            var oldA = thisClass.A;

            thisClass.A = new Array(thisClass.Degree);
            for(var i = 0; i < thisClass.A.length; i++){
                if(i < oldA.length)
                    thisClass.A[i] = oldA[i];
                else
                    thisClass.A[i] = 0;
            }
            $(`#${thisClass.GUID}-coefficients`).html(thisClass.GetCoefficientsHtml());
        });
        
        $(document).on(`change.${this.GUID}`, `#${this.GUID}-A`, function(){
            var index = $(this).data(`index`);
            var val = parseFloat($(this).val());

            thisClass.A[index] = val;
        });
    }

    GetCoefficientsHtml() {
        var coefficients = `<label>Coefficients:</label>`;
        for(var i = this.Degree-1; i > 0; i--)
        {
            coefficients += `<input id="${this.GUID}-A" data-index="${i}" type="number" step="0.1" value="${this.A[i]}"/>`;
            if(i > 1)
                coefficients += ` x<sup>${i}</sup> + `;
            else
                coefficients += ` x + `;
        }
        coefficients += `<input id="${this.GUID}-A" data-index="0" type="number" step="0.1" value="${this.A[0]}"/>`;

        return coefficients;
    }

    GetHtml() {
        var template = GetClassProperty(this, `Template`);

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]min[$]/g, this.MinValue);
        template = template.replace(/[$]max[$]/g, this.MaxValue);
        template = template.replace(/[$]degree[$]/g, this.Degree);

        template = template.replace(/[$]coefficients[$]/g, this.GetCoefficientsHtml());

        return template;
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: `FLOAT`, value: this.MinValue}, //MinValue
            { type: `FLOAT`, value: this.MaxValue}, //MaxValue
            { type: `UINT8`, value: this.Degree}, //Degree
            { type: `FLOAT`, value: this.A}, //coefficients
        ]};

        if (outputVariableId || inputVariableId) 
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables: [ inputVariableId ?? 0 ]
            });

        return objOperation;
    }
}
InputConfigs.push(ConfigOperation_Polynomial);


class ConfigOperation_ReluctorGM24x extends UITemplate {
    static Name = `Reluctor GM 24X`;
    static Output = `ReluctorResult`;
    static Inputs = [`Record`];
    static Measurement = `ReluctorResult`;

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [ 
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.GM24X} //factory ID
        ]};
        
        return Packagize(objOperation, { 
            outputVariables: [ outputVariableId ?? 0 ],
            inputVariables: [ 
                inputVariableId ?? 0,
                `CurrentTickId`
            ]
        });
    }
}
InputConfigs.push(ConfigOperation_ReluctorGM24x);

class ConfigOperation_ReluctorUniversal1x extends UITemplate {
    static Name = `Reluctor Universal 1X`;
    static Output = `ReluctorResult`;
    static Inputs = [`Record`];
    static Measurement = `ReluctorResult`;
    static Template =   `<div><label for="$RisingPosition.GUID$">Rising Edge Position:</label>$RisingPosition$</div>` +
                        `<div><label for="$FallingPosition.GUID$">Falling Edge Position:</label>$FallingPosition$</div>`;

    constructor(prop){
        prop ??= {};
        prop.RisingPosition = new UINumberWithMeasurement({
            Value: 0,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        prop.FallingPosition = new UINumberWithMeasurement({
            Value: 180,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        super(prop);
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [ 
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.Universal1X}, //factory ID
            { type: `FLOAT`, value: this.RisingPosition.Value}, //RisingPosition
            { type: `FLOAT`, value: this.FallingPosition.Value} //FallingPosition
        ]};
            
        return Packagize(objOperation, { 
            outputVariables: [ outputVariableId ?? 0 ],
            inputVariables: [ 
                inputVariableId ?? 0,
                `CurrentTickId`
            ]
        });
    }
}
InputConfigs.push(ConfigOperation_ReluctorUniversal1x);

class ConfigOperation_ReluctorUniversalMissingTeeth extends UITemplate {
    static Name = `Reluctor Universal Missing Teeth`;
    static Output = `ReluctorResult`;
    static Inputs = [`Record`];
    static Measurement = `ReluctorResult`;
    static Template =   `<div><label for="$FirstToothPosition.GUID$">First Tooth Position:</label>$FirstToothPosition$(Falling Edge)</div>` +
                        `<div><label for="$ToothWidth.GUID$">Tooth Width:</label>$ToothWidth$</div>` +
                        `<div><label for="$NumberOfTeeth.GUID$">Number of Teeth:</label>$NumberOfTeeth$</div>` +
                        `<div><label for="$NumberOfTeethMissing.GUID$">Number of Teeth Missing:</label>$NumberOfTeethMissing$</div>`;

    constructor(prop){
        prop ??= {};
        prop.FirstToothPosition = new UINumberWithMeasurement({
            Value: 0,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        prop.ToothWidth = new UINumberWithMeasurement({
            Value: 5,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        prop.NumberOfTeeth = new UINumber({
            Value: 36,
            Min: 2
        });
        prop.NumberOfTeethMissing = new UINumber({
            Value: 1,
            Min: 1
        });
        super(prop);
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [ 
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.UniversalMissintTooth}, //factory ID
            { type: `FLOAT`, value: this.FirstToothPosition.Value}, //FirstToothPosition
            { type: `FLOAT`, value: this.ToothWidth.Value}, //ToothWidth
            { type: `UINT8`, value: this.NumberOfTeeth.Value}, //NumberOfTeeth
            { type: `UINT8`, value: this.NumberOfTeethMissing.Value} //NumberOfTeethMissing
        ]};
            
        return Packagize(objOperation, { 
            outputVariables: [ outputVariableId ?? 0 ],
            inputVariables: [ 
                inputVariableId ?? 0,
                `CurrentTickId`
            ]
        });
    }
}
InputConfigs.push(ConfigOperation_ReluctorUniversalMissingTeeth);