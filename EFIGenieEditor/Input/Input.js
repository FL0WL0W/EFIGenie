import UITemplate from "../JavascriptUI/UITemplate.js"
import UIText from "../JavascriptUI/UIText.js"
import CalculationOrVariableSelection from "../Calculation/CalculationOrVariableSelection.js"
export default class Input extends UITemplate {
    static template = `<div data-element="translationConfig"></div><div data-element="hr"></div><div data-element="rawConfig"></div>`

    hr = document.createElement(`hr`)
    name = new UIText({ class: `pinselectname inputName` })
    translationConfig = new CalculationOrVariableSelection({
        calculations:           InputConfigs,
        ConfigsOnly:            true,
        noParameterSelection:   true
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
        this.name.addEventListener(`change`, function() {
            thisClass.translationConfig.label = thisClass.name.value
        })
        this.translationConfig.addEventListener(`change`, function() {
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
        this.translationConfig.RegisterVariables?.(reference)
        const subConfig = this.translationConfig.SubConfig
        if(!(subConfig == undefined || (subConfig.constructor.inputTypes?.length ?? 0) === 0))
            this.rawConfig.RegisterVariables?.(reference)
    }
}
customElements.define('config-input', Input, { extends: `span` })