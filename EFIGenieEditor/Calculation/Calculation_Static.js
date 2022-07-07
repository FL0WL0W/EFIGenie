import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
export default class Calculation_Static extends UITemplate {
    static displayName = `Static`
    static outputTypes = [ `float` ]
    static template = `<div data-element="numberElement"></div>`

    numberElement = new UINumberWithUnit()

    constructor(prop) {
        super()
        this.Setup(prop)
    }

    get displayUnits() { return [ this.numberElement.displayUnit ] }
    set displayUnits(displayUnits) { this.numberElement.displayUnit = displayUnits?.[0] }
    get outputUnits() { return [ this.numberElement.valueUnit ] }
    set outputUnits(outputUnits) { this.numberElement.valueUnit = outputUnits?.[0] }
    get outputTypes() { return this.outputUnits? undefined : this.constructor.outputTypes }

    get value() { return this.numberElement.value }
    set value(value) { this.numberElement.value = value }
    get saveValue() { return this.numberElement.saveValue }
    set saveValue(saveValue) { this.numberElement.saveValue = saveValue }

    get step() { return this.numberElement.step }
    set step(step) { this.numberElement.step = step }
    get min() { return this.numberElement.min }
    set min(min) { this.numberElement.min = min }
    get max() { return this.numberElement.max }
    set max(max) { this.numberElement.max = max }
}
customElements.define(`calculation-static`, Calculation_Static, { extends: `span` })
GenericConfigs.push(Calculation_Static)