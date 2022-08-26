import UITemplate from "../JavascriptUI/UITemplate.js"
import UIText from "../JavascriptUI/UIText.js"
import CalculationOrVariableSelection from "../Calculation/CalculationOrVariableSelection.js"
import UISelection from "../JavascriptUI/UISelection.js"
import UIUnit from "../UI/UIUnit.js"
export default class Input extends UITemplate {
    static template = `<div style="float: right;"><div data-element="translationConfigMeasurement"></div><div data-element="translationConfigUnit"></div></div><div data-element="translationConfig"></div><div data-element="hr"></div><div data-element="rawConfig"></div>`

    hr = document.createElement(`hr`)
    name = new UIText({ class: `pinselectname inputName` })
    translationConfig = new CalculationOrVariableSelection({
        calculations:           InputConfigs,
        ConfigsOnly:            true,
        noParameterSelection:   true
    })
    translationConfigMeasurement = new UISelection({
        options: Object.keys(Measurements).map(x => { return { name: x, value: x } })
    })
    translationConfigUnit = new UIUnit({
        measurement: `None`,
        hidden: true
    })
    rawConfig = new CalculationOrVariableSelection({
        calculations:           InputConfigs,
        label:                  `Source`,
        inputTypes:             [],
        noParameterSelection:   true,
        hidden:                 true
    })
    constructor(prop) {
        super()
        this.style.display = `block`
        const thisClass = this
        this.translationConfigMeasurement.class = `inputmeasurement`
        this.translationConfigMeasurement.addEventListener(`change`, function() {
            if(thisClass.translationConfigUnit.measurement !== thisClass.translationConfigMeasurement.value) {
                thisClass.translationConfigUnit.measurement = thisClass.translationConfigMeasurement.value
                thisClass.translationConfigUnit.value = thisClass.translationConfigUnit.default
            }
        })
        this.name.addEventListener(`change`, function() {
            thisClass.translationConfig.label = thisClass.name.value
        })
        this.translationConfig.addEventListener(`change`, function() {
            const subConfig = thisClass.translationConfig.SubConfig
            if(subConfig != undefined && (subConfig.constructor.outputUnits?.length ?? 0) === 0 && subConfig.constructor.outputTypes?.[0] === `float`) {
                thisClass.translationConfigMeasurement.hidden = false
                thisClass.translationConfigUnit.hidden = false
            } else {
                thisClass.translationConfigMeasurement.hidden = true
                thisClass.translationConfigUnit.hidden = true
            }
            if(subConfig == undefined || (subConfig.constructor.inputTypes?.length ?? 0) === 0) {
                thisClass.hr.hidden = true
                thisClass.rawConfig.hidden = true
                thisClass.rawConfig.selection.value = undefined
            } else {
                thisClass.hr.hidden = false
                thisClass.rawConfig.hidden = false
            }
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        this.translationConfig.labelElement.replaceWith(this.name)
        this.rawConfig.addEventListener(`change`, function() {
            const subConfig = thisClass.translationConfig.SubConfig
            if(subConfig == undefined || (subConfig.constructor.inputTypes?.length ?? 0) === 0) {
                thisClass.hr.hidden = true
                thisClass.rawConfig.hidden = true
                thisClass.rawConfig.selection.value = undefined
            } else {
                thisClass.hr.hidden = false
                thisClass.rawConfig.hidden = false
            }
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        this.hr.hidden = true
        this.hr.style.margin = `2px`
        prop ??= { }
        this.name.value = prop.name ?? `Name`
        delete prop.name
        this.Setup(prop)
    }

    RegisterVariables() {
        const reference = { name: `Inputs.${this.name.value}` }
        
        const subConfig = this.translationConfig.SubConfig
        if(subConfig != undefined && (subConfig.constructor.outputUnits?.length ?? 0) === 0)
            reference.unit = this.translationConfigUnit.value
        this.translationConfig.RegisterVariables?.(reference)
        delete reference.unit
        if(!(subConfig == undefined || (subConfig.constructor.inputTypes?.length ?? 0) === 0))
            this.rawConfig.RegisterVariables?.(reference)
    }
}
customElements.define('config-input', Input, { extends: `span` })