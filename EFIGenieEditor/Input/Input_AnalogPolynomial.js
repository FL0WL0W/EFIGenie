import UITemplate from "../JavascriptUI/UITemplate.js"
import Input_Analog from "./Input_Analog.js";
import Calculation_Polynomial from "../Calculation/Calculation_Polynomial.js";
export default class Input_AnalogPolynomial extends UITemplate {
    static Template = `<div data-element="VoltageLiveUpdate"></div><div data-element="AnalogInput"></div><div data-element="Polynomial"></div>`;
    static Output = `float`;
    static Inputs = [];

    constructor(prop){
        super();
        this.AnalogInput = new Input_Analog();
        this.Polynomial = new Calculation_Polynomial();
        this.VoltageLiveUpdate = new DisplayLiveUpdate({
            Measurement: Input_Analog.Measurement
        });
        this.VoltageLiveUpdate.style.float = `right`;
        this.Setup(prop);
        this.style.display = `block`;
    }

    RegisterVariables() {
        VariableRegister.RegisterVariable(
            `${this.ReferenceName}(Voltage)`,
            `float`
        );
        this.VoltageLiveUpdate.VariableReference = `${this.ReferenceName}(Voltage)`;
        this.VoltageLiveUpdate.RegisterVariables();
    }

    GetObjOperation(outputVariableId) {
        return { type: `Group`, value: [
            this.AnalogInput.GetObjOperation(`${this.ReferenceName}(Voltage)`),
            this.Polynomial.GetObjOperation(outputVariableId, `${this.ReferenceName}(Voltage)`)
        ]};
    }
}
customElements.define(`input-analogpolynomial`, Input_AnalogPolynomial, { extends: `span` });