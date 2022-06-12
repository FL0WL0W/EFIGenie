import Input_DigitalRecord from "../Input/Input_DigitalRecord.js";
export default class Reluctor_Template extends Input_DigitalRecord {
    static output = `ReluctorResult`;
    static measurementName = `Reluctor`;
    static inputs = [];
    static template = Input_DigitalRecord.template.substring(0, Input_DigitalRecord.template.lastIndexOf(`Inverted`) + 8)

    RegisterVariables() {
        VariableRegister.RegisterVariable(`${this.referenceName}(Record)`, "Record")
    }

    GetObjOperation(objOperation) {
        return { type: `Group`, value: [
            super.GetObjOperation(`${this.referenceName}(Record)`),
            objOperation
        ]};
    }
}
customElements.define(`reluctor-template`, Reluctor_Template, { extends: `span` });