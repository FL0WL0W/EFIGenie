import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
export default class Calculation_Static extends UITemplate {
    static displayName = `Static`
    static outputTypes = [ `float` ]
    static template = `<div data-element="numberElement"></div>`

    constructor(prop) {
        super()
        this.numberElement = new UINumberWithUnit({
            valueUnit: prop?.outputUnits?.[0],
            displayUnit: prop?.displayUnits?.[0]
        })
        this.Setup(prop)
    }
    set class(pclass) { this.numberElement.class = pclass }
    get min() { return this.numberElement.min }
    set min(min) { this.numberElement.min = min }
    get max() { return this.numberElement.max }
    set max(max) { this.numberElement.max = max }
    get step() { return this.numberElement.step }
    set step(step) { this.numberElement.step = step }
    
    get displayUnit() { return this.numberElement.displayUnit }
    set displayUnit(displayUnit) { this.numberElement.displayUnit = displayUnit }
    get displayValue() { return this.numberElement.displayValue }
    set displayValue(displayValue) { this.numberElement.displayValue = displayValue }
    get measurement() { return this.numberElement.measurement }
    set measurement(measurement) { this.numberElement.measurement = measurement }
    get valueUnit() { return this.numberElement.valueUnit }
    set valueUnit(valueUnit) { this.numberElement.valueUnit = valueUnit }
    get value() { return this.numberElement.value }
    set value(value) { this.numberElement.value = value }
    get saveValue() { return this.numberElement.saveValue }
    set saveValue(saveValue) { this.numberElement.saveValue = saveValue }

    get outputUnits() { return [ this.valueUnit ] }
    set outputUnits(outputUnits) { 
        this.valueUnit = outputUnits?.[0]
        if(outputUnits?.[0] != undefined)
            this.measurement = GetMeasurementNameFromUnitName(outputUnits?.[0])
    }
    get displayUnits() { return [ this.displayUnit ] }
    set displayUnits(displayUnits) { this.displayUnit = displayUnits?.[0] }
}
customElements.define(`calculation-static`, Calculation_Static, { extends: `span` })
GenericConfigs.push(Calculation_Static)