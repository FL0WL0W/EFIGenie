import Input_DigitalRecord from "../Input/Input_DigitalRecord.js";
export default class Reluctor_Template extends Input_DigitalRecord {
    static Output = `ReluctorResult`;
    static Measurement = `Reluctor`;
    static Inputs = [];
    static Template = Input_DigitalRecord.Template.substring(0, Input_DigitalRecord.Template.lastIndexOf(`Inverted`) + 8)

    GetObjOperation(objOperation) {
        return { type: `Group`, value: [
            super.GetObjOperation(`${this.ReferenceName}(Reluctor)`),
            objOperation
        ]};
    }
}
customElements.define(`reluctor-template`, Reluctor_Template, { extends: `span` });