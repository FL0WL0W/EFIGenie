import UITemplate from "../JavascriptUI/UITemplate.js"
import UIText from "../JavascriptUI/UIText.js"
import CalculationOrVariableSelection from "../Calculation/CalculationOrVariableSelection.js"

export default class Input extends UITemplate {
    static template = `<div style="float: right;"></div><div data-element="translationConfig"></div><div data-element="hr"></div><div data-element="rawConfig"></div>`

    get outputTypes() { return this.translationConfig.outputTypes }
    set outputTypes(outputTypes) { this.translationConfig.outputTypes = outputTypes }
    get outputUnits() { return this.translationConfig.outputUnits }
    set outputUnits(outputUnits) { this.translationConfig.outputUnits = outputUnits }

    hr = document.createElement(`hr`)
    name = new UIText({ class: `pinselectname inputName` })
    translationConfig = new CalculationOrVariableSelection({
        calculations:           InputConfigs,
        selectionFilter:        function() {
            return function(calcOrVar) {
                if(calcOrVar.type || calcOrVar.unit) 
                    return false
                return true
            }
        },
        noParameterSelection:   true
    })
    rawConfig = new CalculationOrVariableSelection({
        calculations:           InputConfigs,
        selectionFilter:        defaultNoVariables,
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
            thisClass.translationConfig.inputUnits = thisClass.translationConfig.inputTypes = undefined
            if((thisClass.translationConfig.inputUnits?.length ?? thisClass.translationConfig.inputTypes?.length ?? 0) === 0) {
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
            if(thisClass.rawConfig.outputUnits?.[0]) {
                thisClass.translationConfig.inputUnits = thisClass.rawConfig.outputUnits
                thisClass.translationConfig.xLabel = GetMeasurementNameFromUnitName(thisClass.rawConfig.outputUnits?.[0])
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
        if(!((this.translationConfig.inputUnits?.length ?? this.translationConfig.inputTypes?.length ?? 0) === 0))
            this.rawConfig.RegisterVariables?.(reference)
    }
}
customElements.define('config-input', Input, { extends: `span` })