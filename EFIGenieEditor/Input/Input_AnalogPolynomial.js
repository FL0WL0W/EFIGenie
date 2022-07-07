import UITemplate from "../JavascriptUI/UITemplate.js"
import Input_Analog from "./Input_Analog.js"
import Calculation_Polynomial from "../Calculation/Calculation_Polynomial.js"
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js"
export default class Input_AnalogPolynomial extends UITemplate {
    static template = `<div data-element="voltageLiveUpdate"></div><div data-element="analogInput"></div><div data-element="polynomial"></div>`

    get value() { return { 
        ...super.value, 
        polynomial: { 
            ...this.polynomial.value, 
            outputUnits: this.constructor.outputUnits
        } } }
    set value(value) { super.value = value }

    constructor(prop){
        super()
        this.analogInput = new Input_Analog()
        this.polynomial = new Calculation_Polynomial({outputUnits: this.constructor.outputUnits})
        this.voltageLiveUpdate = new UIDisplayLiveUpdate({
            valueUnit: Input_Analog.outputUnits[0]
        })
        this.voltageLiveUpdate.style.float = `right`
        this.Setup(prop)
        this.style.display = `block`
    }

    RegisterVariables(reference) {
        delete reference.unit
        delete reference.type
        delete reference.id
        VariableRegister.RegisterVariable({ ...reference, unit: `V`})
        VariableRegister.RegisterVariable({ ...reference, unit: this.constructor.outputUnits[0] })
        this.voltageLiveUpdate.RegisterVariables({ ...reference, unit: `V`})
    }
}
customElements.define(`input-analogpolynomial`, Input_AnalogPolynomial, { extends: `span` })