var CurrentTickVariableID = 0;
var RawInputConfigs = [];
var InputConfigs = [
    { Group: `Generic Pin Input`, Configs: RawInputConfigs},
    { Group: `Custom Input`, Configs: [ 
        Calculation_Static,
        Calculation_LookupTable
    ]}
];

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

PinOuts = {
    STM32F103C: { 
        Name: `Blue pill: STM32F103C`,
        Overlay: `images/STM32F103C_Overlay.png`,
        OverlayWidth: 844,
        OverlayElementHeight: 24,
        Pins: [
            { Name: `PC_13`, Value: (16*2 + 13), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 174, Align: `right`},
            { Name: `PC_14`, Value: (16*2 + 14), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 200, Align: `right`},
            { Name: `PC_15`, Value: (16*2 + 15), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 226, Align: `right`},
            { Name: `PA_0`,  Value: (16*0 + 0 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 844, OverlayY: 252, Align: `right`},
            { Name: `PA_1`,  Value: (16*0 + 1 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 278, Align: `right`},
            { Name: `PA_2`,  Value: (16*0 + 2 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 304, Align: `right`},
            { Name: `PA_3`,  Value: (16*0 + 3 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 330, Align: `right`},
            { Name: `PA_4`,  Value: (16*0 + 4 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 844, OverlayY: 356, Align: `right`},
            { Name: `PA_5`,  Value: (16*0 + 5 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 844, OverlayY: 382, Align: `right`},
            { Name: `PA_6`,  Value: (16*0 + 6 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 408, Align: `right`},
            { Name: `PA_7`,  Value: (16*0 + 7 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 434, Align: `right`},
            { Name: `PB_0`,  Value: (16*1 + 0 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 460, Align: `right`},
            { Name: `PB_1`,  Value: (16*1 + 1 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 486, Align: `right`},
            { Name: `PB_10`, Value: (16*1 + 10), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 512, Align: `right`},
            { Name: `PB_11`, Value: (16*1 + 11), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 538, Align: `right`},
            { Name: `PB_9`,  Value: (16*1 + 9 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 226, Align: `left`},
            { Name: `PB_8`,  Value: (16*1 + 8 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 252, Align: `left`},
            { Name: `PB_7`,  Value: (16*1 + 7 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 278, Align: `left`},
            { Name: `PB_6`,  Value: (16*1 + 6 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 304, Align: `left`},
            { Name: `PB_5`,  Value: (16*1 + 5 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 330, Align: `left`},
            { Name: `PB_4`,  Value: (16*1 + 4 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 356, Align: `left`},
            { Name: `PB_3`,  Value: (16*1 + 3 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 382, Align: `left`},
            { Name: `PA_15`, Value: (16*0 + 15), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 408, Align: `left`},
            { Name: `PA_12`, Value: (16*0 + 12), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 434, Align: `left`},
            { Name: `PA_11`, Value: (16*0 + 11), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 460, Align: `left`},
            { Name: `PA_10`, Value: (16*0 + 10), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 486, Align: `left`},
            { Name: `PA_9`,  Value: (16*0 + 9 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 512, Align: `left`},
            { Name: `PA_8`,  Value: (16*0 + 8 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 538, Align: `left`},
            { Name: `PB_15`, Value: (16*1 + 15), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 564, Align: `left`},
            { Name: `PB_14`, Value: (16*1 + 14), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 590, Align: `left`},
            { Name: `PB_13`, Value: (16*1 + 13), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 616, Align: `left`},
            { Name: `PB_12`, Value: (16*1 + 12), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 642, Align: `left`},
        ]
    },
    STM32F401C : { 
        Name: `Black pill: STM32F401C/STM32F411C`,
        Overlay: `images/STM32F401C_Overlay.png`,
        OverlayWidth: 577,
        OverlayElementHeight: 22,
        Pins: [
            { Name: `PC_13`, Value: (16*2 + 13), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 132, Align: `right`},
            { Name: `PC_14`, Value: (16*2 + 14), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 154, Align: `right`},
            { Name: `PC_15`, Value: (16*2 + 15), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 176, Align: `right`},
            { Name: `PA_0`,  Value: (16*0 + 0 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 577, OverlayY: 220, Align: `right`},
            { Name: `PA_1`,  Value: (16*0 + 1 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 242, Align: `right`},
            { Name: `PA_2`,  Value: (16*0 + 2 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 264, Align: `right`},
            { Name: `PA_3`,  Value: (16*0 + 3 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 286, Align: `right`},
            { Name: `PA_4`,  Value: (16*0 + 4 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 577, OverlayY: 308, Align: `right`},
            { Name: `PA_5`,  Value: (16*0 + 5 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 577, OverlayY: 330, Align: `right`},
            { Name: `PA_6`,  Value: (16*0 + 6 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 352, Align: `right`},
            { Name: `PA_7`,  Value: (16*0 + 7 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 374, Align: `right`},
            { Name: `PB_0`,  Value: (16*1 + 0 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 396, Align: `right`},
            { Name: `PB_1`,  Value: (16*1 + 1 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 418, Align: `right`},
            { Name: `PB_2`,  Value: (16*1 + 2 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 440, Align: `right`},
            { Name: `PB_10`, Value: (16*1 + 10), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 462, Align: `right`},
            { Name: `PB_9`,  Value: (16*1 + 9 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 176, Align: `left`},
            { Name: `PB_8`,  Value: (16*1 + 8 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 198, Align: `left`},
            { Name: `PB_7`,  Value: (16*1 + 7 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 220, Align: `left`},
            { Name: `PB_6`,  Value: (16*1 + 6 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 242, Align: `left`},
            { Name: `PB_5`,  Value: (16*1 + 5 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 264, Align: `left`},
            { Name: `PB_4`,  Value: (16*1 + 4 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 286, Align: `left`},
            { Name: `PB_3`,  Value: (16*1 + 3 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 308, Align: `left`},
            { Name: `PA_15`, Value: (16*0 + 15), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 330, Align: `left`},
            { Name: `PA_12`, Value: (16*0 + 12), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 352, Align: `left`},
            { Name: `PA_11`, Value: (16*0 + 11), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 374, Align: `left`},
            { Name: `PA_10`, Value: (16*0 + 10), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 396, Align: `left`},
            { Name: `PA_9`,  Value: (16*0 + 9 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 418, Align: `left`},
            { Name: `PA_8`,  Value: (16*0 + 8 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 440, Align: `left`},
            { Name: `PB_15`, Value: (16*1 + 15), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 462, Align: `left`},
            { Name: `PB_14`, Value: (16*1 + 14), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 484, Align: `left`},
            { Name: `PB_13`, Value: (16*1 + 13), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 506, Align: `left`},
            { Name: `PB_12`, Value: (16*1 + 12), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 528, Align: `left`},
        ]
    }
};

var PinOut = PinOuts.STM32F103C;

function ParsePinSelectElements(pinSelectElements){
    var elements = [];
    if(pinSelectElements) {
        for(var i=0; i<pinSelectElements.length; i++) {
            const pinSelectElementSelector = $(pinSelectElements[i]);
            elements.push({
                name: GetNameFromPinSelectElement(pinSelectElements[i]),
                pinselectmode: pinSelectElementSelector.attr(`data-pinselectmode`),
                pin: pinSelectElements[i].value
            });
        }
    }
    return elements;
}

function GetNameFromPinSelectChildren(element){
    const elementSelector = $(element);

    if(elementSelector.hasClass(`pinselectname`)){
        const name = elementSelector.val();
        if(!name)
            return elementSelector.text();
        return name;
    }

    const elements = elementSelector.children();
    for(var i = 0; i < elements?.length; i++) {
        const name = GetNameFromPinSelectChildren(elements[i]);
        if(name)
            return name;
    }
}

function GetNameFromPinSelectElement(element){
    if(!element)
        return;
    const name = GetNameFromPinSelectChildren(element);
    if(name)
        return name;

    return GetNameFromPinSelectElement(element.parentElement);
}

//The overlay is a bit of a javascript hack, but it works well so I'm not changing it.
function GenerateOverlay() {
    var pinSelectElements = ParsePinSelectElements($(`.pinselect`));
    let scale = 700 / (PinOut.OverlayWidth + 300);
    var ret = `<div style="width: ${PinOut.OverlayWidth + 300}px; position: relative; transform-origin: top left; transform: scale(${scale}););"><img src="${PinOut.Overlay}" style="position: absolute; left: 150px;"></img><br>`;
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
            if(PinOut.Pins[i].SupportedModes.split(` `).indexOf(pinSelectElements[s].pinselectmode) === -1) {
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
            `; left: ${PinOut.Pins[i].Align === `left`? PinOut.Pins[i].OverlayX + 150: PinOut.OverlayWidth - PinOut.Pins[i].OverlayX}px;">` +
            `<option value="" disabled ${selectCount != 1? `selected` : ``}>select</option>${sel}</select>`;

        ret += sel;
    }
    return `${ret}</div>`;
}

function UpdateOverlay() {
    $(`.gpiooverlay`).html(GenerateOverlay());
    $(`.gpiooverlay`).css(`transform`, `scale(${700 / (PinOut.OverlayWidth + 300)})`);
}

//if any changes are needed in ConfigInputs, refactor to use UI.OldTemplate
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
            onChange: function() {$(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());}
        });
    }

    get saveValue() {
        var saveValue = { Inputs: [], TargetDevice: this.TargetDevice };

        for(var i = 0; i < this.Inputs.length; i++){
            saveValue.Inputs.push(this.Inputs[i].saveValue);
        }

        return saveValue;
    }

    set saveValue(saveValue) {
        this.Detach();

        if(saveValue) {
            if(saveValue.TargetDevice) {
                this.TargetDevice = saveValue.TargetDevice;
                PinOut = PinOuts[this.TargetDevice];
            }
            else if(!saveValue.Inputs) {
                saveValue = { Inputs: saveValue };
            }

            for(var i = 0; i < saveValue.Inputs.length; i++){
                if(i >= this.Inputs.length)
                    this.Inputs.push(this.NewInput());
                this.Inputs[i].saveValue = saveValue.Inputs[i];
            }
            this.Inputs = this.Inputs.slice(0, saveValue.Inputs.length)
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

            $(`#${thisClass.GUID}-${selected}`)[0].scrollIntoView();
        });
                
        $(document).on(`contextmenu.${this.GUID}`, `#${this.GUID}-inputs div`, function(e){
            var relativeX = (e.pageX - window.scrollX),
                relativeY = (e.pageY - window.scrollY);

            $(`#${thisClass.GUID}-contextmenu`).show();
            $(`#${thisClass.GUID}-contextmenu`).css(`left`, `${relativeX}px`);
            $(`#${thisClass.GUID}-contextmenu`).css(`top` , `${relativeY}px`);
            thisClass.ContextSelect = $(this).data(`index`);
            $(`#${thisClass.GUID}-inputs div`).removeClass(`active`);
            $(this).addClass(`active`);
            
            e.preventDefault();
        });
        $(document).on(`click.${this.GUID}`, function(){
            $(`#${thisClass.GUID}-contextmenu`).hide();
            $(`#${thisClass.GUID}-inputs div`).removeClass(`active`);
        });

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-add`, function(){
            if(isNaN(thisClass.ContextSelect))
                return;

            thisClass.Inputs.splice(thisClass.ContextSelect + 1, 0, thisClass.NewInput());
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID}-delete`, function(){
            if(isNaN(thisClass.ContextSelect))
                return;
            
            thisClass.Inputs.splice(thisClass.ContextSelect, 1);
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-duplicate`, function(){
            if(isNaN(thisClass.ContextSelect))
                return;
            
            thisClass.Inputs.push(this.NewInput());
            thisClass.Inputs[thisClass.Inputs.length-1].saveValue = thisClass.Inputs[contextSelect].saveValue;
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID} .controladd`, function(){
            var selected = $(this).data('i');
            
            thisClass.Inputs.splice(selected + 1, 0, thisClass.NewInput());
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID} .controldelete`, function(){
            var selected = $(this).data('i');
            
            thisClass.Inputs.splice(selected, 1);
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID} .controlup`, function(){
            var selected = $(this).data('i');

            var temp = thisClass.Inputs[selected];
            thisClass.Inputs[selected] = thisClass.Inputs[selected - 1];
            thisClass.Inputs[selected - 1] = temp;
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID} .controldown`, function(){
            var selected = $(this).data('i');

            var temp = thisClass.Inputs[selected];
            thisClass.Inputs[selected] = thisClass.Inputs[selected + 1];
            thisClass.Inputs[selected + 1] = temp;
            $(`#${thisClass.GUID}-inputs`).replaceWith(thisClass.GetInputsHtml());
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.Attach();
        });

        UpdateOverlay();
    }

    GetInputsHtml() {

        var inputlist = ``;
        for(var i = 0; i < this.Inputs.length; i++){
            var liveUpdate = this.Inputs[i].TranslationConfig.LiveUpdate;
            if(!this.Inputs[i].TranslationConfig.Selection.Value)
                liveUpdate = this.Inputs[i].RawConfig.LiveUpdate;
            inputlist += `<div data-index="${i}" class="w3-bar-subitem w3-button">${this.Inputs[i].Name.Value}<span style="float: right;">${liveUpdate.GetHtml()}</span></div>`;
        }
        if(this.Inputs.length === 0){
            this.ContextSelect = -1;
            inputlist = `<div id="${this.GUID}-add" class="w3-bar-subitem w3-button"><span class="monospace">+ </span>New</div>`;
        }
        return `<div id="${this.GUID}-inputs">${inputlist}</div>`;
    }

    GetHtml() {
        var template = GetClassProperty(this, `Template`);

        template = template.replace(/[$]id[$]/g, this.GUID);
        

        var configs = ``;
        for(var i = 0; i < this.Inputs.length; i++)
        {
            configs += `<div id="${this.GUID}-${i}" class="inputconfig"><span style="float: right;">`;
            configs += `<span class="controldelete" data-i="${i}">-</span>`;
            if(i !== 0)
                configs += `<span class="controlup" data-i="${i}">↑</span>`;
            else
                configs += `<span class="controldummy">&nbsp;</span>`;
            if(i !== this.Inputs.length - 1)
                configs += `<span class="controldown" data-i="${i}">↓</span>`;
            else
                configs += `<span class="controldummy">&nbsp;</span>`;

            configs += `</span>${this.Inputs[i].GetHtml()}</div><div class="inputSpacer"></div>`;
        }
        configs += `<span class="controladd" data-i="${this.Inputs.length-1}">+ New</span>`;

        template = template.replace(/[$]inputconfig[$]/g, configs);
        template = template.replace(/[$]overlay[$]/g, GenerateOverlay());

        return template;
    }

    RegisterVariables() {
        VariableRegister.CurrentTickId = VariableRegister.GenerateVariableId();
        for(var i = 0; i < this.Inputs.length; i++){
            this.Inputs[i].RegisterVariables();
        }
    }

    GetObjOperation() {
        var group = { type: `Group`, value: [
            { 
                type: `Package`, //Package
                value: [{ type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.GetTick }], //GetTick factory ID
                outputVariables: [`CurrentTickId`]
            }
        ]};
        for(var i = 0; i < this.Inputs.length; i++){
            group.value.push(this.Inputs[i].GetObjOperation());
        }

        return group;
    }
}

class ConfigInput extends UI.OldTemplate {
    static Template = `<div>$Name$</div>
<div class="configContainer">
    $TranslationConfig$
    <hr id="$GUID$-hr" style="$HRDisplay$margin: 2px;"/>
    <div id="$GUID$-raw">$RawConfigReplacer$</div>
</div>`

    constructor(prop) {
        super();
        const thisClass = this;
        prop ??= {};
        const measurementKeys = Object.keys(Measurements)
        var options = [];
        measurementKeys.forEach(function(measurement) {options.push({Name: measurement, Value: measurement})});
        this.RawConfig = new CalculationOrVariableSelection({
            Configs:            InputConfigs,
            label:              `Source`,
            Inputs:             [],
            ReferenceName:      `Inputs.${prop.Name}`,
            noParameterSelection: true
        });
        this.TranslationConfig = new CalculationOrVariableSelection({
            Configs:            InputConfigs,
            label:              prop.Name ?? `Input`,
            ConfigsOnly:        true,
            Measurement:        `None`,
            ReferenceName:      `Inputs.${prop.Name}`,
            noParameterSelection: true,
            Template: CalculationOrVariableSelection.Template.replace(`$label$`, `Input\\$TranslationMeasurement\\$`),
            onChange: function() { 
                const subConfig = thisClass.TranslationConfig.GetSubConfig();
                if(subConfig === undefined || subConfig.constructor.Inputs === undefined || subConfig.constructor.Inputs.length === 0) {
                    $(`#${thisClass.GUID}-hr`).hide();
                    thisClass.HRDisplay = `display: none; `;
                    $(`#${thisClass.GUID}-raw`).html(``);
                    thisClass.RawConfigReplacer = ``
                } else {
                    thisClass.RawConfig.Output = subConfig.constructor.Inputs[0];
                    $(`#${thisClass.GUID}-hr`).show();
                    thisClass.HRDisplay = ``;
                    $(`#${thisClass.GUID}-raw`).html(thisClass.RawConfig.GetHtml());
                    thisClass.RawConfigReplacer = `$RawConfig$`
                }
            }
        });
        this.TranslationMeasurement = new UI.Selection({
            Value:              `None`,
            selectNotVisible:   true,
            options:            options,
            onChange:           function() { thisClass.TranslationConfig.Measurement = thisClass.TranslationMeasurement.Value; }
        });
        prop.Name = new UI.Text({
            Value: prop.Name ?? `Input`,
            Class: `pinselectname inputName`,
            onChange: function() { 
                thisClass.TranslationConfig.ReferenceName = thisClass.RawConfig.ReferenceName = `Inputs.${thisClass.Name.Value}`;
                thisClass.TranslationConfig.label = thisClass.Name.Value;
            }
        })
        this.HRDisplay = `display: none; `;
        this.Setup(prop);
    }

    RegisterVariables() {
        this.TranslationConfig.RegisterVariables?.();
        const subConfig = this.TranslationConfig.GetSubConfig();
        if(!(subConfig === undefined || subConfig.constructor.Inputs === undefined || subConfig.constructor.Inputs.length === 0))
            this.RawConfig.RegisterVariables?.();
    }

    GetObjOperation() {
        const translationConfig = this.TranslationConfig.GetSubConfig();
        if(translationConfig === undefined)
            return undefined;

        if(translationConfig.constructor.Inputs === undefined || translationConfig.constructor.Inputs.length === 0)
            return this.TranslationConfig.GetObjOperation();
        
        const rawConfigObj = this.RawConfig.GetObjOperation();
        const rawConfigVariable = this.RawConfig.GetVariableReference();
        const translationConfigObj = this.TranslationConfig.GetObjOperation(rawConfigVariable);
        return { type: `Group`, value: [
            rawConfigObj,
            translationConfigObj
        ]};
    }
}

class UIPinSelection extends UI.Selection {
    constructor(prop){
        super(prop);
        this.selectDisabled = prop.selectDisabled ?? true;
        this.selectValue = prop.selectValue ?? 0xFFFF;
        this.options = this.#generateOptionList();
        this.addEventListener(`change`, function() {
            UpdateOverlay();
        });
        this.selectedElement.dataset.pinselectmode = this.PinType;
        this.selectedElement.classList.add(`pinselect`);
    }
    
    #generateOptionList() {
        var options = []
        var endOptions = [];
        for(var i = 0; i < PinOut.Pins.length; i++) {
            const selected = this.Value === PinOut.Pins[i].Value;
            if(PinOut.Pins[i].SupportedModes.split(` `). indexOf(this.PinType) === -1) {
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
customElements.define('ui-pinselection', UIPinSelection, { extends: `div` });

class Input_Analog extends UI.Template {
    static Name = `Analog Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Voltage`;
    static Template = `<label>Pin:</label><div data-element="Pin"></div>`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `analog`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.AnalogInput}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
        ]};

        if (outputVariableId)
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
RawInputConfigs.push(Input_Analog);
customElements.define(`input-analog`, Input_Analog, { extends: `div` });

class Input_Digital extends UI.Template {
    static Name = `Digital Pin`;
    static Output = `bool`;
    static Inputs = [];
    static Measurement = `Bool`;
    static Template = `<label>Pin:</label><div data-element="Pin"></div><div data-element="Inverted"></div>Inverted`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `digital`
        });
        this.Inverted = new UI.CheckBox();
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalInput}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `BOOL`, value: this.Inverted.Value}, //inverted
        ]};

        if (outputVariableId)
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
RawInputConfigs.push(Input_Digital);
customElements.define(`input-digital`, Input_Digital, { extends: `div` });

class Input_DigitalRecord extends UI.Template {
    static Name = `Digital Pin (Record)`;
    static Output = `Record`;
    static Inputs = [];
    static Measurement = `Record`;
    static Template =   `<label>Pin:</label><div data-element="Pin"></div><div data-element="Inverted"></div>Inverted` +
                        `<br/><label>Length:</label><div data-element="Length"></div>`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `digitalinterrupt`
        });
        this.Inverted = new UI.CheckBox();
        this.Length = new UI.Number ({
            Value: 2,
            step: 1,
            min: 1,
            max: 1000
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalPinRecord}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `BOOL`, value: this.Inverted.Value}, //inverted
            { type: `UINT16`, value: this.Length.Value}, //length
        ]};

        if (outputVariableId) 
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
RawInputConfigs.push(Input_DigitalRecord);
customElements.define(`input-digitalrecord`, Input_DigitalRecord, { extends: `div` });

class Input_DutyCycle extends UI.Template {
    static Name = `Duty Cycle Pin Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Percentage`;
    static Template =   `<label>Pin:</label><div data-element="Pin"></div>` +
                        `<br/><label>Minimum Frequency:</label><div data-element="MinFrequency"></div>`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `pwm`
        });
        this.MinFrequency = new UI.NumberWithMeasurement({
            Value: 1000,
            step: 1,
            min: 0,
            max: 65535,
            Measurement: `Frequency`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DutyCyclePinRead}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `UINT16`, value: this.MinFrequency.Value}, //minFrequency
        ]};

        if (outputVariableId) 
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
RawInputConfigs.push(Input_DutyCycle);
customElements.define(`input-dutycycle`, Input_DutyCycle, { extends: `div` });

class Input_Frequency extends UI.Template {
    static Name = `Frequency Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Frequency`;
    static Template =   `<label>Pin:</label><div data-element="Pin"></div>` +
                        `<br/><label>Minimum Frequency:</label><div data-element="MinFrequency"></div>`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `pwm`
        });
        this.MinFrequency = new UI.NumberWithMeasurement({
            Value: 1000,
            step: 1,
            min: 0,
            max: 65535,
            Measurement: `Frequency`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.FrequencyPinRead}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `UINT16`, value: this.MinFrequency.Value}, //minFrequency
        ]};

        if (outputVariableId) 
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
RawInputConfigs.push(Input_Frequency);
customElements.define(`input-frequency`, Input_Frequency, { extends: `div` });

class Input_PulseWidth extends UI.Template {
    static Name = `Pulse Width Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Time`;
    static Template =   `<label>Pin:</label><div data-element="Pin"></div>` +
                        `<br/><label>Minimum Frequency:</label><div data-element="MinFrequency"></div>`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `pwm`
        });
        this.MinFrequency = new UI.NumberWithMeasurement({
            Value: 1000,
            step: 1,
            min: 0,
            max: 65535,
            Measurement: `Frequency`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.PulseWidthPinRead}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `UINT16`, value: this.MinFrequency.Value}, //minFrequency
        ]};

        if (outputVariableId) 
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
RawInputConfigs.push(Input_PulseWidth);
customElements.define(`input-pulsewidth`, Input_PulseWidth, { extends: `div` });