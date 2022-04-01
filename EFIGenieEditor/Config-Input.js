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

class PinOverlay extends HTMLDivElement {
    get pinSelectElements() {
        function getNameFromPinSelectChildren(element){
            if(element.classList.contains(`pinselectname`)){
                const name = element.value;
                if(!name)
                    return element.textContent;
                return name;
            }
    
            const elements = element.children;
            for(var i = 0; i < elements?.length; i++) {
                const name = getNameFromPinSelectChildren(elements[i]);
                if(name)
                    return name;
            }
        }
        function getNameFromPinSelectElement(element){
            if(!element)
                return;
            const name = getNameFromPinSelectChildren(element);
            if(name)
                return name;
    
            return getNameFromPinSelectElement(element.parentElement);
        }

        let pinSelectElements = [...document.querySelectorAll(`.pinselect`)];
        var elements = [];
        if(pinSelectElements) {
            for(var i=0; i<pinSelectElements.length; i++) {
                elements.push({
                    name: getNameFromPinSelectElement(pinSelectElements[i]),
                    pinselectmode: pinSelectElements[i].getAttribute(`data-pinselectmode`),
                    pin: pinSelectElements[i].value,
                    element: pinSelectElements[i]
                });
            }
        }
        return elements;
    }

    #pinOut;
    get pinOut() {
        return this.#pinOut;
    }
    set pinOut(pinOut) {
        if(!pinOut)
            return;
        this.#pinOut = pinOut;
        let scale = 750 / (pinOut.OverlayWidth + 300);
        this.style.width = pinOut.OverlayWidth;
        this.style.transform = `scale(${scale})`;
        this.overlayImage.src = pinOut.Overlay;
        while(pinOut.Pins.length < this.pinElements.children.length) this.pinElements.removeChild(this.pinElements.lastChild);
        for(let i = 0; i < pinOut.Pins.length; i++) {
            let pinElement = this.pinElements.children[i];
            if(!pinElement) {
                pinElement = this.pinElements.appendChild(new UI.Selection());
                pinElement.firstChild.style.minWidth = `100px`;
                pinElement.style.width = `150px`;
                pinElement.style.position = `absolute`;
                Object.defineProperty(pinElement, 'pinSelectElements', {
                    set: function(pinSelectElements) { 
                        this._pinSelectElements = pinSelectElements;
                        let options = [];
                        let selectedOption;
                        for(let s=0; s<pinSelectElements.length; s++) {
                            let option = {
                                Name: pinSelectElements[s].name,
                                Value: s,
                                Disabled: this.supportedModes.split(` `).indexOf(pinSelectElements[s].pinselectmode) === -1
                            };
                            if(pinSelectElements[s].pin == this.pin) {
                                if(selectedOption) {
                                    option.Class = selectedOption.Class = `pinconflict`;
                                    selectedOption = `conflict`;
                                } else {
                                    selectedOption = option;
                                }
                            }
                            options.push(option);
                        }
                        this.options = options;
                        if(!selectedOption) {
                            this.value = undefined;
                        } else if(selectedOption === `conflict`) {
                            this.classList.add(`pinconflict`)
                            this.value = undefined;
                        }
                        else {
                            this.classList.remove(`pinconflict`)
                            this.value = selectedOption.Value;
                        }
                    }
                });
                pinElement.addEventListener(`change`, function() {
                    if(this.value !== undefined)
                        this._pinSelectElements[this.value].element.parentElement.value = this.pin;
                });
            }
            pinElement.pin = pinOut.Pins[i].Value;
            pinElement.supportedModes = pinOut.Pins[i].SupportedModes;
            pinElement.style.top = pinOut.Pins[i].OverlayY - pinOut.OverlayElementHeight / 2 + `px`;
            pinElement.style.left = (pinOut.Pins[i].Align === `left`? pinOut.Pins[i].OverlayX + 150 : pinOut.OverlayWidth - pinOut.Pins[i].OverlayX) + `px`;
        }
        this.update();
    }
    update() {
        let pinSelectElements = this.pinSelectElements;
        [...this.pinElements.children].forEach(element => element.pinSelectElements = pinSelectElements);
    }
    pinElements = document.createElement(`div`);
    overlayImage = document.createElement(`img`);
    constructor() {
        super();
        this.class = `pinoverlay`;
        this.overlayImage.style.position = `absolute`;
        this.overlayImage.style.left = `150px`;
        this.append(this.overlayImage);
        this.append(this.pinElements);
    }
}
customElements.define('config-pinoverlay', PinOverlay, { extends: `div` });

let pinOverlay = new PinOverlay();

function UpdateOverlay() {
    pinOverlay.update();
}

//todo, context menu
class ConfigInputs extends UI.Template {
    static Template = `<div style="block-size: fit-content; width: fit-content;"><div data-element="Inputs"></div><div data-element="newInputElement"></div></div><div data-element="pinOverlay"></div>`
    inputListElement = document.createElement(`div`);
    pinOverlay = pinOverlay;

    Attach() {
        super.Attach();
        this.inputListElement.Attach();
    }

    TargetDevice = `STM32F401C`;
    get saveValue() {
        let saveValue = super.saveValue;
        saveValue.TargetDevice = this.TargetDevice;
        return saveValue;
    }

    set saveValue(saveValue) {
        if(!saveValue)
            return;
            
        if(saveValue.TargetDevice) {
            this.TargetDevice = saveValue.TargetDevice;
            pinOverlay.pinOut = PinOuts[this.TargetDevice];
            delete saveValue.TargetDevice;
        }

        super.saveValue = saveValue;
    }
    constructor(prop) {
        super();
        this.Inputs = document.createElement(`div`);
        const thisClass = this;
        Object.defineProperty(this.Inputs, 'saveValue', {
            get: function() { return [...this.children].map(e => e.saveValue); },
            set: function(saveValue) { 
                while(this.children.length > saveValue.length) this.removeChild(this.lastChild);
                for(let i = 0; i < saveValue.length; i++){
                    if(!this.children[i]) {
                        thisClass.#appendInput();
                    }
                    this.children[i].saveValue = saveValue[i];
                }
            }
        });
        Object.defineProperty(this.Inputs, 'value', {
            get: function() { return [...this.children].map(e => e.value); },
            set: function(value) { 
                while(this.children.length > value.length) this.removeChild(this.lastChild);
                for(let i = 0; i < value.length; i++){
                    if(!this.children[i]) {
                        thisClass.#appendInput();
                    }
                    this.children[i].value = value[i];
                }
            }
        });
        this.Inputs.saveValue = [{}];
        this.newInputElement = new UI.Button({className: `controladd`});
        this.newInputElement.addEventListener(`click`, function() { thisClass.#appendInput(); });
        this.inputListNewElement = document.createElement(`div`);
        this.inputListNewElement.class = `w3-bar-subitem w3-button`;
        this.inputListNewElement.textContent = `+ New`;
        this.inputListNewElement.addEventListener(`click`, function() { thisClass.#appendInput(); });
        this.Setup(prop);
    }

    RegisterVariables() {
        VariableRegister.CurrentTickId = VariableRegister.GenerateVariableId();
        for(var i = 0; i < this.Inputs.children.length; i++){
            this.Inputs.children[i].RegisterVariables();
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
        for(var i = 0; i < this.Inputs.children.length; i++){
            group.value.push(this.Inputs.children[i].GetObjOperation());
        }

        return group;
    }

    #updateInputControls() {
        for(let i = 0; i < this.Inputs.children.length; i++) {
            let up = this.Inputs.children[i].firstChild.children[1];
            let down = this.Inputs.children[i].firstChild.children[2];
            if(i === 0) {
                up.className = `controlDummy`;
                up.disabled = true;
            } else {
                up.className = `controlUp`;
                up.disabled = false;
            }
            if(i === this.Inputs.children.length-1) {
                down.className = `controlDummy`;
                down.disabled = true;
            } else {
                down.className = `controlDown`;
                down.disabled = false;
            }
        }
        this.#updateInputListElement();
    }

    #updateInputListElement() {
        const thisClass = this;
        this.inputListElement.innerHTML = ``;
        while(this.Inputs.children.length < this.inputListElement.children.length) this.inputListElement.removeChild(this.inputListElement.lastChild);
        for(let i = 0; i < this.Inputs.children.length; i++){
            let inputElement = this.inputListElement.children[i];
            if(!inputElement) {
                inputElement = this.inputListElement.appendChild(document.createElement(`div`));
                inputElement.class = `w3-bar-subitem w3-button`;
                inputElement.addEventListener(`click`, function() {
                    let index = [...thisClass.inputListElement.children].indexOf(this);
                    thisClass.Inputs.children[index].scrollIntoView({
                        behavior: 'auto',
                        block: 'center',
                        inline: 'center'
                    });
                });
            }
            inputElement.textContent = this.Inputs.children[i].Name;
            inputElement.class = `w3-bar-subitem w3-button`;
        }
        if(this.Inputs.children.length === 0){
            let inputElement = this.inputListElement.appendChild(document.createElement(`div`));
            inputElement.appendChild(this.inputListNewElement);
        }
    }

    #appendInput() {
        this.Inputs.append(this.#newInput());
        this.#updateInputControls();
    }

    #newInput() {
        const thisClass = this;
        let input = document.createElement(`div`);
        let controlElement = input.appendChild(document.createElement(`span`));
        controlElement.style.float = `right`;
        let deleteElement = controlElement.appendChild(document.createElement(`span`));
        deleteElement.className = `controldelete`;
        deleteElement.addEventListener(`click`, function() {
            this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement);
            thisClass.#updateInputControls();
        });
        let upElement = controlElement.appendChild(document.createElement(`span`));
        upElement.className = `controlup`;
        upElement.addEventListener(`click`, function() {
            if(upElement.disabled)
                return;
            this.parentElement.parentElement.previousSibling.before(this.parentElement.parentElement);
            thisClass.#updateInputControls();
        });
        let downElement = controlElement.appendChild(document.createElement(`span`));
        downElement.className = `controldown`;
        downElement.addEventListener(`click`, function() {
            if(downElement.disabled)
                return;
            this.parentElement.parentElement.nextSibling.after(this.parentElement.parentElement);
            thisClass.#updateInputControls();
        });
        input.append(new ConfigInput());
        input.RegisterVariables = function() { this.lastChild.RegisterVariables(); };
        input.GetObjOperation = function() { return this.lastChild.GetObjOperation(); };
        Object.defineProperty(input, 'saveValue', {
            get: function() { return this.lastChild.saveValue; },
            set: function(saveValue) { this.lastChild.saveValue = saveValue; }
        });
        Object.defineProperty(input, 'value', {
            get: function() { return this.lastChild.value; },
            set: function(value) { this.lastChild.saveValue = value; }
        });
        Object.defineProperty(input, 'Name', {
            get: function() { return this.lastChild.Name.value; },
            set: function(value) { this.lastChild.Name.value = value; }
        });
        input.lastChild.Name.addEventListener(`change`, function() {
            thisClass.#updateInputListElement();
        });
        return input;
    }
}
customElements.define('config-inputs', ConfigInputs, { extends: `div` });

class ConfigInput extends UI.Template {
    static Template = `<div data-element="Name"></div>
<div class="configContainer">
    <div data-element="TranslationConfig"></div>
    <div data-element="hr"></div>
    <div data-element="RawConfig"></div>
</div>`

    hr = document.createElement(`hr`);
    constructor(prop) {
        super();;
        prop ??= { };
        prop.Name ??= `Input`;
        this.style.display = `block`;
        const thisClass = this
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
        this.RawConfig.addEventListener(`change`, function() {
            UpdateOverlay();
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.TranslationConfig = new CalculationOrVariableSelection({
            Configs:            InputConfigs,
            label:              prop.Name,
            ConfigsOnly:        true,
            Measurement:        `None`,
            ReferenceName:      `Inputs.${prop.Name}`,
            noParameterSelection: true
        });
        this.TranslationConfig.addEventListener(`change`, function() {
            const subConfig = thisClass.TranslationConfig.GetSubConfig();
            if(subConfig === undefined || subConfig.constructor.Inputs === undefined || subConfig.constructor.Inputs.length === 0) {
                thisClass.hr.hidden = true;
                thisClass.RawConfig.hidden = true;
                thisClass.RawConfig.Selection.value = undefined;
            } else {
                thisClass.hr.hidden = false;
                thisClass.RawConfig.hidden = false;
            }
            UpdateOverlay();
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.RawConfig.addEventListener(`change`, function() {
            const subConfig = thisClass.TranslationConfig.GetSubConfig();
            if(subConfig === undefined || subConfig.constructor.Inputs === undefined || subConfig.constructor.Inputs.length === 0) {
                thisClass.hr.hidden = true;
                thisClass.RawConfig.hidden = true;
                thisClass.RawConfig.Selection.value = undefined;
                UpdateOverlay();
            } else {
                thisClass.hr.hidden = false;
                thisClass.RawConfig.hidden = false;
                UpdateOverlay();
            }
        });
        this.TranslationMeasurement = new UI.Selection({
            Value:              `None`,
            selectNotVisible:   true,
            options:            options,
        });
        this.TranslationMeasurement.addEventListener(`change`, function() {
            thisClass.TranslationConfig.Measurement = thisClass.TranslationMeasurement.Value;
        });
        this.TranslationConfig.labelElement.replaceWith(this.TranslationMeasurement);
        this.Name = new UI.Text({
            Value: prop.Name,
            Class: `pinselectname inputName`
        })
        this.Name.addEventListener(`change`, function() {
            thisClass.TranslationConfig.ReferenceName = thisClass.RawConfig.ReferenceName = `Inputs.${thisClass.Name.Value}`;
            thisClass.TranslationConfig.label = thisClass.Name.Value;
        });
        this.Name.style.display = `block`;
        this.hr.hidden = true;
        this.hr.style.margin = `2px`;
        delete prop.Name;
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
customElements.define('config-input', ConfigInput, { extends: `div` });

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
        let pinOut = pinOverlay.pinOut;
        for(var i = 0; i < pinOut.Pins.length; i++) {
            const selected = this.Value === pinOut.Pins[i].Value;
            if(pinOut.Pins[i].SupportedModes.split(` `). indexOf(this.PinType) === -1) {
                endOptions.push({
                    Name: pinOut.Pins[i].Name,
                    Value: pinOut.Pins[i].Value,
                    Selected: selected,
                    Class: selected? `incompatible` : undefined,
                    Disabled: true
                });
            } else {
                options.push({
                    Name: pinOut.Pins[i].Name,
                    Value: pinOut.Pins[i].Value,
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