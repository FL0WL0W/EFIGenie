import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class Calculation_Static extends UINumberWithMeasurement {
    static displayName = `Static`;
    static output = `float`;
    static inputs = [];

    GetObjOperation(outputVariableId) {
        var obj = { value: [{ type: `Operation_StaticVariable`, value: this.value }] };

        if (outputVariableId) {
            obj.value[0].result = outputVariableId;
        }

        return obj;
    }
}
customElements.define(`calculation-static`, Calculation_Static, { extends: `span` });
GenericConfigs.push(Calculation_Static);