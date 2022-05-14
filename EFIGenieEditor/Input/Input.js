import UITemplate from "../JavascriptUI/UITemplate.js";
import UISelection from "../JavascriptUI/UISelection.js";
import UIText from "../JavascriptUI/UIText.js";
export default class Input extends UITemplate {
    static template = `<div data-element="TranslationConfig"></div><div data-element="hr"></div><div data-element="RawConfig"></div>`

    get saveValue() {
        return super.saveValue;
    }
    set saveValue(saveValue) {
        saveValue.name ??= saveValue.Name;
        super.saveValue = saveValue;
    }

    hr = document.createElement(`hr`);
    constructor(prop) {
        super();;
        prop ??= { };
        prop.name ??= `Name`;
        this.style.display = `block`;
        const thisClass = this
        this.RawConfig = new CalculationOrVariableSelection({
            calculations:            InputConfigs,
            label:              `Source`,
            inputs:             [],
            referenceName:      `Inputs.${prop.name}`,
            noParameterSelection: true,
            hidden: true
        });
        this.RawConfig.addEventListener(`change`, function() {
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.TranslationConfig = new CalculationOrVariableSelection({
            calculations:            InputConfigs,
            label:              prop.name,
            ConfigsOnly:        true,
            referenceName:      `Inputs.${prop.name}`,
            noParameterSelection: true
        });
        this.TranslationConfig.addEventListener(`change`, function() {
            const subConfig = thisClass.TranslationConfig.GetSubConfig();
            if(subConfig === undefined || subConfig.constructor.inputs === undefined || subConfig.constructor.inputs.length === 0) {
                thisClass.hr.hidden = true;
                thisClass.RawConfig.hidden = true;
                thisClass.RawConfig.selection.value = undefined;
            } else {
                thisClass.hr.hidden = false;
                thisClass.RawConfig.hidden = false;
            }
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.RawConfig.addEventListener(`change`, function() {
            const subConfig = thisClass.TranslationConfig.GetSubConfig();
            if(subConfig === undefined || subConfig.constructor.inputs === undefined || subConfig.constructor.inputs.length === 0) {
                thisClass.hr.hidden = true;
                thisClass.RawConfig.hidden = true;
                thisClass.RawConfig.selection.value = undefined;
            } else {
                thisClass.hr.hidden = false;
                thisClass.RawConfig.hidden = false;
            }
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        var options = [];
        this.translationType = new UISelection({
            value:              `None`,
            selectNotVisible:   true,
            options:            options,
        });
        this.translationType.addEventListener(`change`, function() {
            thisClass.translationType.value;
        });
        this.name = new UIText({
            value: prop.name,
            class: `pinselectname inputName`
        })
        this.name.addEventListener(`change`, function() {
            thisClass.TranslationConfig.referenceName = thisClass.RawConfig.referenceName = `Inputs.${thisClass.name.value}`;
            thisClass.TranslationConfig.label = thisClass.name.value;
        });
        this.TranslationConfig.labelElement.replaceWith(this.name);
        this.hr.hidden = true;
        this.hr.style.margin = `2px`;
        delete prop.name;
        this.Setup(prop);
    }

    RegisterVariables() {
        this.TranslationConfig.RegisterVariables?.();
        const subConfig = this.TranslationConfig.GetSubConfig();
        if(!(subConfig === undefined || subConfig.constructor.inputs === undefined || subConfig.constructor.inputs.length === 0))
            this.RawConfig.RegisterVariables?.();
    }

    GetObjOperation() {
        const translationConfig = this.TranslationConfig.GetSubConfig();
        if(translationConfig === undefined)
            return undefined;

        if(translationConfig.constructor.inputs === undefined || translationConfig.constructor.inputs.length === 0)
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
customElements.define('config-input', Input, { extends: `span` });