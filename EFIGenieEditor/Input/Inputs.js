import UITemplate from "../JavascriptUI/UITemplate.js";
import UIButton from "../JavascriptUI/UIButton.js";
import Input from "./Input.js";
import UIPinOverlay from "../UI/UIPinOverlay.js"
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js";
//todo, context menu
export default class Inputs extends UITemplate {
    static template = `<div style="block-size: fit-content; width: fit-content;"><div data-element="inputs"></div><div data-element="newInputElement"></div></div><div data-element="pinOverlay"></div>`
    inputListElement = document.createElement(`div`);
    pinOverlay = new UIPinOverlay();

    _targetDevice = `STM32F401C`;
    get targetDevice() {
        return this._targetDevice;
    }
    set targetDevice(targetDevice) {
        this._targetDevice = targetDevice;
        this.pinOverlay.pinOut = PinOuts[targetDevice];
    }

    get saveValue() {
        let saveValue = super.saveValue;
        saveValue.targetDevice = this.targetDevice;
        return saveValue;
    }

    set saveValue(saveValue) {
        if(!saveValue)
            return;
            
        saveValue.inputs ??= saveValue.Inputs;
        saveValue.targetDevice ??= saveValue.TargetDevice;
        if(saveValue.targetDevice) {
            this.targetDevice = saveValue.targetDevice;
            delete saveValue.targetDevice;
            delete saveValue.TargetDevice;
        }

        super.saveValue = saveValue;
    }
    constructor(prop) {
        super();
        this.inputs = document.createElement(`div`);
        const thisClass = this;
        Object.defineProperty(this.inputs, 'saveValue', {
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
        Object.defineProperty(this.inputs, 'value', {
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
        this.inputs.saveValue = [{}];
        this.newInputElement = new UIButton({className: `controladd`});
        this.newInputElement.addEventListener(`click`, function() { thisClass.#appendInput(); });
        this.inputListNewElement = document.createElement(`div`);
        this.inputListNewElement.class = `w3-bar-subitem w3-button`;
        this.inputListNewElement.textContent = `+ New`;
        this.inputListNewElement.addEventListener(`click`, function() { thisClass.#appendInput(); });
        this.Setup(prop);
    }

    RegisterVariables() {
        VariableRegister.CurrentTickId = VariableRegister.GenerateVariableId();
        for(var i = 0; i < this.inputs.children.length; i++){
            this.inputs.children[i].RegisterVariables();
        }
        for(var i = 0; i < this.inputListElement.children.length; i++){
            this.inputListElement.children[i].RegisterVariables();
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
        for(var i = 0; i < this.inputs.children.length; i++){
            group.value.push(this.inputs.children[i].GetObjOperation());
        }

        return group;
    }

    #updateInputControls() {
        for(let i = 0; i < this.inputs.children.length; i++) {
            let up = this.inputs.children[i].firstChild.children[1];
            let down = this.inputs.children[i].firstChild.children[2];
            if(i === 0) {
                up.className = `controlDummy`;
                up.disabled = true;
            } else {
                up.className = `controlUp`;
                up.disabled = false;
            }
            if(i === this.inputs.children.length-1) {
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
        while(this.inputs.children.length < this.inputListElement.children.length) this.inputListElement.removeChild(this.inputListElement.lastChild);
        for(let i = 0; i < this.inputs.children.length; i++){
            let inputElement = this.inputListElement.children[i];
            if(!inputElement) {
                inputElement = this.inputListElement.appendChild(document.createElement(`div`));
                inputElement.appendChild(new UIDisplayLiveUpdate()).style.float = `right`;
                inputElement.append(document.createElement(`div`));
                inputElement.class = `w3-bar-subitem w3-button`;
                inputElement.addEventListener(`click`, function() {
                    let index = [...thisClass.inputListElement.children].indexOf(this);
                    thisClass.inputs.children[index].scrollIntoView({
                        behavior: 'auto',
                        block: 'center',
                        inline: 'center'
                    });
                });
                inputElement.RegisterVariables = function() {
                    let index = [...thisClass.inputListElement.children].indexOf(this);
                    let input = thisClass.inputs.children[index];
                    this.firstChild.VariableReference = input.lastChild.TranslationConfig?.liveUpdate?.VariableReference;
                    this.firstChild.RegisterVariables();
                }
            }
            inputElement.lastChild.textContent = this.inputs.children[i].name;
            inputElement.class = `w3-bar-subitem w3-button`;
        }
        if(this.inputs.children.length === 0){
            let inputElement = this.inputListElement.appendChild(document.createElement(`div`));
            inputElement.appendChild(this.inputListNewElement);
        }
    }

    #appendInput() {
        this.inputs.append(this.#newInput());
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
        input.append(new Input());
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
        Object.defineProperty(input, 'name', {
            get: function() { return this.lastChild.name.value; },
            set: function(value) { this.lastChild.name.value = value; }
        });
        input.lastChild.addEventListener(`change`, function() {
            thisClass.#updateInputListElement();
            thisClass.pinOverlay.update();
        });
        return input;
    }
}
customElements.define('config-inputs', Inputs, { extends: `span` });