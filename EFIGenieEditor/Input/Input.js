import UITemplate from "../JavascriptUI/UITemplate.js";
import UISelection from "../JavascriptUI/UISelection.js";
import UIText from "../JavascriptUI/UIText.js";
export default class Input extends UITemplate {
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
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.RawConfig.addEventListener(`change`, function() {
            const subConfig = thisClass.TranslationConfig.GetSubConfig();
            if(subConfig === undefined || subConfig.constructor.Inputs === undefined || subConfig.constructor.Inputs.length === 0) {
                thisClass.hr.hidden = true;
                thisClass.RawConfig.hidden = true;
                thisClass.RawConfig.Selection.value = undefined;
            } else {
                thisClass.hr.hidden = false;
                thisClass.RawConfig.hidden = false;
            }
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.TranslationMeasurement = new UISelection({
            Value:              `None`,
            selectNotVisible:   true,
            options:            options,
        });
        this.TranslationMeasurement.addEventListener(`change`, function() {
            thisClass.TranslationConfig.Measurement = thisClass.TranslationMeasurement.Value;
        });
        this.TranslationConfig.labelElement.replaceWith(this.TranslationMeasurement);
        this.Name = new UIText({
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
customElements.define('config-input', Input, { extends: `span` });