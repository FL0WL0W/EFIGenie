import UITemplate from "../JavascriptUI/UITemplate.js"
import UIText from "../JavascriptUI/UIText.js"
import CalculationOrVariableSelection from "../Calculation/CalculationOrVariableSelection.js"
export default class Input extends UITemplate {
    static template = `<div data-element="translationConfig"></div><div data-element="hr"></div><div data-element="rawConfig"></div>`

    hr = document.createElement(`hr`)
    constructor(prop) {
        super()
        prop ??= { }
        prop.name ??= `Name`
        this.style.display = `block`
        const thisClass = this
        this.rawConfig = new CalculationOrVariableSelection({
            calculations:            InputConfigs,
            label:              `Source`,
            inputTypes:             [],
            noParameterSelection: true,
            hidden: true
        })
        this.rawConfig.addEventListener(`change`, function() {
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        this.translationConfig = new CalculationOrVariableSelection({
            calculations:            InputConfigs,
            label:              prop.name,
            ConfigsOnly:        true,
            noParameterSelection: true
        })
        this.translationConfig.addEventListener(`change`, function() {
            const subConfig = thisClass.translationConfig.SubConfig
            if(subConfig === undefined || (subConfig.constructor.inputTypes?.length ?? 0) === 0) {
                thisClass.hr.hidden = true
                thisClass.rawConfig.hidden = true
                thisClass.rawConfig.selection.value = undefined
            } else {
                thisClass.hr.hidden = false
                thisClass.rawConfig.hidden = false
            }
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        this.rawConfig.addEventListener(`change`, function() {
            const subConfig = thisClass.translationConfig.SubConfig
            if(subConfig === undefined || (subConfig.constructor.inputTypes?.length ?? 0) === 0) {
                thisClass.hr.hidden = true
                thisClass.rawConfig.hidden = true
                thisClass.rawConfig.selection.value = undefined
            } else {
                thisClass.hr.hidden = false
                thisClass.rawConfig.hidden = false
            }
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        this.name = new UIText({
            value: prop.name,
            class: `pinselectname inputName`
        })
        this.name.addEventListener(`change`, function() {
            thisClass.translationConfig.label = thisClass.name.value
        })
        this.translationConfig.labelElement.replaceWith(this.name)
        this.hr.hidden = true
        this.hr.style.margin = `2px`
        delete prop.name
        this.Setup(prop)
    }

    RegisterVariables() {
        const reference = { name: `Inputs.${this.name.value}` }
        this.translationConfig.RegisterVariables?.(reference)
        const subConfig = this.translationConfig.SubConfig
        if(!(subConfig === undefined || (subConfig.constructor.inputTypes?.length ?? 0) === 0))
            this.rawConfig.RegisterVariables?.(reference)
    }
}
customElements.define('config-input', Input, { extends: `span` })