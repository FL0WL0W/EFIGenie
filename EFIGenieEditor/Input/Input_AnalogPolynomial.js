import UITemplate from "../JavascriptUI/UITemplate.js"
import Input_Analog from "./Input_Analog.js"
import Calculation_Polynomial from "../Calculation/Calculation_Polynomial.js"
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js"
export default class Input_AnalogPolynomial extends UITemplate {
    static outputTypes = [ `float` ]
    static template = `<div data-element="voltageLiveUpdate"></div><div data-element="analogInput"></div><div data-element="polynomial"></div>`

    get displayUnit() { return this.polynomial.displayUnit }
    set displayUnit(displayUnit) { this.polynomial.displayUnit = displayUnit }
    get measurement() { return this.polynomial.measurement }
    set measurement(measurement) { this.polynomial.measurement = measurement }
    get valueUnit() { return this.polynomial.valueUnit }
    set valueUnit(valueUnit) { this.polynomial.valueUnit = valueUnit }
    get outputUnits() { return this.polynomial.outputUnits }
    set outputUnits(outputUnits) { this.polynomial.outputUnits = outputUnits }
    get displayUnits() { return this.polynomial.displayUnits }
    set displayUnits(displayUnits) { this.polynomial.displayUnits = displayUnits }

    analogInput = new Input_Analog()
    polynomial = new Calculation_Polynomial()
    voltageLiveUpdate = new UIDisplayLiveUpdate({ valueUnit: Input_Analog.outputUnits[0] })
    constructor(prop){
        super()
        this.voltageLiveUpdate.style.float = `right`
        this.Setup(prop)
        this.style.display = `block`
    }

    RegisterVariables(reference) {
        reference = { ...reference }
        delete reference.unit
        delete reference.type
        delete reference.id
        VariableRegister.RegisterVariable({ ...reference, unit: `V`})
        this.voltageLiveUpdate.RegisterVariables({ ...reference, unit: `V`})
    }
}
customElements.define(`input-analogpolynomial`, Input_AnalogPolynomial, { extends: `span` })