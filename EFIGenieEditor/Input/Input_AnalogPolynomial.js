import UITemplate from "../JavascriptUI/UITemplate.js"
import Input_Analog from "./Input_Analog.js";
import Calculation_Polynomial from "../Calculation/Calculation_Polynomial.js";
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js";
export default class Input_AnalogPolynomial extends UITemplate {
    static template = `<div data-element="voltageLiveUpdate"></div><div data-element="analogInput"></div><div data-element="polynomial"></div>`;
    static output = `float`;
    static inputs = [];

    get value() { return { 
        ...super.value, 
        polynomial: { 
            ...this.polynomial.value, 
            outputMeasurements: this.constructor.measurementName === undefined? undefined : [this.constructor.measurementName]
        }, type: "Input_AnalogPolynomial" } }
    set value(value) { super.value = value }

    constructor(prop){
        super();
        this.analogInput = new Input_Analog();
        this.polynomial = new Calculation_Polynomial({measurementName: this.constructor.measurementName});
        this.voltageLiveUpdate = new UIDisplayLiveUpdate({
            measurementName: Input_Analog.measurementName
        });
        this.voltageLiveUpdate.style.float = `right`;
        this.Setup(prop);
        this.style.display = `block`;
    }

    RegisterVariables(referenceName) {
        VariableRegister.RegisterVariable(
            `${referenceName}(Voltage)`,
            `float`
        );
        VariableRegister.RegisterVariable(
            `${referenceName}(${this.constructor.measurementName})`,
            `float`
        );
        this.voltageLiveUpdate.VariableReference = `${referenceName}(Voltage)`;
        this.voltageLiveUpdate.RegisterVariables();
    }
}
customElements.define(`input-analogpolynomial`, Input_AnalogPolynomial, { extends: `span` });