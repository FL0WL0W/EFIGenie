import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class Calculation_Static extends UINumberWithMeasurement {
    static Name = `Static`;
    static Output = `float`;
    static Inputs = [];

    GetObjOperation(outputVariableId) {
        var obj = { value: [{ type: `Operation_StaticVariable`, value: this.Value }] };

        if (outputVariableId) {
            obj.value[0].result = outputVariableId;
        }

        return obj;
    }
}
customElements.define(`calculation-static`, Calculation_Static, { extends: `span` });
GenericConfigs.push(Calculation_Static);