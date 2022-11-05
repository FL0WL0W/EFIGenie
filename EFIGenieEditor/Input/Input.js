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
        this.name.addEventListener(`change`, () =>{
            this.translationConfig.label = this.name.value
        })
        this.translationConfig.addEventListener(`change`, () => {
            this.translationConfig.inputUnits = this.translationConfig.inputTypes = undefined
            if((this.translationConfig.inputUnits?.length ?? this.translationConfig.inputTypes?.length ?? 0) === 0) {
                this.hr.hidden = true
                this.rawConfig.hidden = true
                this.rawConfig.selection.value = undefined
            } else {
                this.hr.hidden = false
                this.rawConfig.hidden = false
            }
            this.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        this.translationConfig.labelElement.replaceWith(this.name)
        this.rawConfig.addEventListener(`change`, () => {
            if(this.rawConfig.outputUnits?.[0]) {
                this.translationConfig.inputUnits = this.rawConfig.outputUnits
                this.translationConfig.xLabel = GetMeasurementNameFromUnitName(this.rawConfig.outputUnits?.[0])
            }
            this.dispatchEvent(new Event(`change`, {bubbles: true}))
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