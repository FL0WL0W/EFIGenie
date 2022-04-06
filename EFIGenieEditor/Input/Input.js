import UITemplate from "../JavascriptUI/UITemplate.js";
import UISelection from "../JavascriptUI/UISelection.js";
import UIText from "../JavascriptUI/UIText.js";
export default class Input extends UITemplate {
    static Template = `<div data-element="name"></div>
<div class="configContainer">
    <div data-element="TranslationConfig"></div>
    <div data-element="hr"></div>
    <div data-element="RawConfig"></div>
</div>`

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
        prop.name ??= `Input`;
        this.style.display = `block`;
        const thisClass = this
        const measurementKeys = Object.keys(Measurements)
        var options = [];
        measurementKeys.forEach(function(measurement) {options.push({name: measurement, value: measurement})});
        this.RawConfig = new CalculationOrVariableSelection({
            calculations:            InputConfigs,
            label:              `Source`,
            Inputs:             [],
            ReferenceName:      `Inputs.${prop.name}`,
            noParameterSelection: true
        });
        this.RawConfig.addEventListener(`change`, function() {
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.TranslationConfig = new CalculationOrVariableSelection({
            calculations:            InputConfigs,
            label:              prop.name,
            ConfigsOnly:        true,
            measurementName:        `None`,
            ReferenceName:      `Inputs.${prop.name}`,
            noParameterSelection: true
        });
        this.TranslationConfig.addEventListener(`change`, function() {
            const subConfig = thisClass.TranslationConfig.GetSubConfig();
            if(subConfig === undefined || subConfig.constructor.Inputs === undefined || subConfig.constructor.Inputs.length === 0) {
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
            if(subConfig === undefined || subConfig.constructor.Inputs === undefined || subConfig.constructor.Inputs.length === 0) {
                thisClass.hr.hidden = true;
                thisClass.RawConfig.hidden = true;
                thisClass.RawConfig.selection.value = undefined;
            } else {
                thisClass.hr.hidden = false;
                thisClass.RawConfig.hidden = false;
            }
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.TranslationMeasurement = new UISelection({
            value:              `None`,
            selectNotVisible:   true,
            options:            options,
        });
        this.TranslationMeasurement.addEventListener(`change`, function() {
            thisClass.TranslationConfig.measurementName = thisClass.TranslationMeasurement.value;
        });
        this.TranslationConfig.labelElement.replaceWith(this.TranslationMeasurement);
        this.name = new UIText({
            value: prop.name,
            Class: `pinselectname inputName`
        })
        this.name.addEventListener(`change`, function() {
            thisClass.TranslationConfig.ReferenceName = thisClass.RawConfig.ReferenceName = `Inputs.${thisClass.name.value}`;
            thisClass.TranslationConfig.label = thisClass.name.value;
        });
        this.name.style.display = `block`;
        this.hr.hidden = true;
        this.hr.style.margin = `2px`;
        delete prop.name;
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
customElements.define('config-input', Input, { extends: `span` });