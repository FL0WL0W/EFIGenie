import UITemplate from "../JavascriptUI/UITemplate.js";
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class Calculation_Static extends UITemplate {
    static template = `<span data-element="valueElement"></span>`
    static displayName = `Static`;
    static output = `float`;
    static inputs = [];

    constructor(prop) {
        super()
        this.valueElement = new UINumberWithMeasurement(prop);
        this.Setup(prop)
    }

    get value() {
        return {
            type: `Calculation_Static`,
            value: this.valueElement.value
        }
    }
    set value(value) {
        if(typeof value === `object`)
            this.valueElement.value = value.value
        else
            this.valueElement.value = value
    }

    get saveValue() {
        return this.valueElement.saveValue;
    }
    set saveValue(saveValue) {
        this.valueElement.saveValue = saveValue
    }

    GetObjOperation(result) {
        let obj = this.value
        obj.result = result

        return obj
    }
}
customElements.define(`calculation-static`, Calculation_Static, { extends: `span` });
GenericConfigs.push(Calculation_Static);