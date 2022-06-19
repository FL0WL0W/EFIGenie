import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class Calculation_Static extends UINumberWithMeasurement {
    static displayName = `Static`;
    static output = `float`;
    static inputs = [];

    GetObjOperation(result) {
        return { 
            type: `Calculation_StaticVariable`, 
            value: this.value,
            result: result
        }
    }
}
customElements.define(`calculation-static`, Calculation_Static, { extends: `span` });
GenericConfigs.push(Calculation_Static);