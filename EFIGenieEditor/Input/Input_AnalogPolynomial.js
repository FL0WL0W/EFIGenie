import UITemplate from "../JavascriptUI/UITemplate.js"
import Input_Analog from "./Input_Analog.js";
import Calculation_Polynomial from "../Calculation/Calculation_Polynomial.js";
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js";
export default class Input_AnalogPolynomial extends UITemplate {
    static template = `<div data-element="voltageLiveUpdate"></div><div data-element="analogInput"></div><div data-element="polynomial"></div>`;
    static output = `float`;
    static inputs = [];

    constructor(prop){
        super();
        this.analogInput = new Input_Analog();
        this.polynomial = new Calculation_Polynomial();
        this.voltageLiveUpdate = new UIDisplayLiveUpdate({
            measurementName: Input_Analog.measurementName
        });
        this.voltageLiveUpdate.style.float = `right`;
        this.Setup(prop);
        this.style.display = `block`;
    }

    RegisterVariables() {
        VariableRegister.RegisterVariable(
            `${this.referenceName}(Voltage)`,
            `float`
        );
        this.voltageLiveUpdate.VariableReference = `${this.referenceName}(Voltage)`;
        this.voltageLiveUpdate.RegisterVariables();
    }

    GetObjOperation(outputVariableId) {
        return { type: `Group`, value: [
            this.analogInput.GetObjOperation(`${this.referenceName}(Voltage)`),
            this.polynomial.GetObjOperation(outputVariableId, `${this.referenceName}(Voltage)`)
        ]};
    }
}
customElements.define(`input-analogpolynomial`, Input_AnalogPolynomial, { extends: `span` });