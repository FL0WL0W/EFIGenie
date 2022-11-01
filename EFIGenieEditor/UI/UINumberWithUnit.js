import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumber from "../JavascriptUI/UINumber.js"
import UIUnit from "./UIUnit.js"
export default class UINumberWithUnit extends UITemplate {
    static template = `<div data-element="displayValueElement"></div><div data-element="displayUnitElement"></div>`
    
    get measurement() { return this.displayUnitElement.measurement }
    set measurement(measurement) { this.displayUnitElement.measurement = measurement }
    get displayUnit() { return this.displayUnitElement.value }
    set displayUnit(displayUnit) { this.displayUnitElement.value = displayUnit ?? this._valueUnit }
    get displayValue() { return this.displayValueElement.value }
    set displayValue(displayValue) { this.displayValueElement.value = displayValue }

    _valueUnit
    get valueUnit() { return this._valueUnit ?? this.displayUnit }
    set valueUnit(valueUnit) { 
        if(this._valueUnit === valueUnit) return
        let newValue = ConvertValueFromUnitToUnit(this.value, this._valueUnit, valueUnit)
        this._valueUnit = valueUnit
        this.displayUnit ??= valueUnit
        this.value = newValue
    }
    #value
    get value() { return this.#value }
    set value(value) {
        if(this.#value === value) return
        this.#value = value
        this.UpdateDisplayValue()
    }

    set class(pclass) { this.displayValueElement.class = pclass }

    #min
    get min() { return this.#min }
    set min(min) {
        if(this.#min === min) return
        this.#min = min
        this.UpdateDisplayValue()
    }

    #max
    get max() { return this.#max }
    set max(max) {
        if(this.#max === max) return
        this.#max = max
        this.UpdateDisplayValue()
    }

    #step
    get step() { return this.#step }
    set step(step) {
        if(this.#step === step) return
        this.#step = step
        this.UpdateDisplayValue()
    }

    constructor(prop) {
        super()
        const thisClass = this
        this.displayUnitElement = new UIUnit({
            measurement : prop?.measurement,
            value: prop?.displayUnit ?? prop?.valueUnit
        })
        let oldUnit = this.displayUnit
        this.displayUnitElement.addEventListener(`change`, function() {
            if(thisClass.displayValue != undefined)
                thisClass.displayValue = ConvertValueFromUnitToUnit(thisClass.displayValue, oldUnit, thisClass.displayUnit)
            oldUnit = thisClass.displayUnit
        })
        this.displayValueElement = new UINumber()
        this.displayValueElement.addEventListener(`change`, function() {
            if(thisClass.displayValue != undefined && thisClass.displayUnit)
                thisClass.#value = ConvertValueFromUnitToUnit(thisClass.displayValue, thisClass.displayUnit, thisClass.valueUnit)
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        this.Setup(prop)
    }

    get saveValue() {
        return {
            unit: this.displayUnitElement.saveValue,
            value: this.value
        }
    }
    set saveValue(saveValue){
        if(typeof saveValue === `object`) {
            this.displayUnitElement.saveValue = saveValue.unit
            this.value = saveValue.value ?? saveValue.value
        } else {
            this.value = saveValue
        }
    }

    UpdateDisplayValue() {
        const displayUnit = this.displayUnit
        const valueUnit = this.valueUnit
        function valueToDisplayValue(value) { return value == undefined || !displayUnit? value : ConvertValueFromUnitToUnit(value, valueUnit, displayUnit) }
        this.displayValue               = valueToDisplayValue(this.value)   ?? this.displayValue
        this.displayValueElement.min    = valueToDisplayValue(this.min)     ?? this.displayValueElement.min
        this.displayValueElement.max    = valueToDisplayValue(this.max)     ?? this.displayValueElement.max
        this.displayValueElement.step   = valueToDisplayValue(this.step)    ?? this.displayValueElement.step
    }
}
customElements.define(`ui-numberwithunit`, UINumberWithUnit, { extends: `span` })