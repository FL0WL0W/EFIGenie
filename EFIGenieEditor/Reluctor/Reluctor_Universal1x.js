import Reluctor_Template from "./Reluctor_Template.js";
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class Reluctor_Universal1x extends Reluctor_Template {
    static displayName = `Reluctor Universal 1X`;
    static template =   Reluctor_Template.template +
                        `<br/><label>Rising Edge Position:</label><div data-element="risingPosition"></div>` +
                        `<br/><label>Falling Edge Position:</label><div data-element="fallingPosition"></div>`;

    get value() {
        let value = super.value
        value.type = `Reluctor_Universal1x`
        return value
    }
    set value(value) {
        super.value = value
    }

    constructor(prop){
        super();
        prop.risingPosition = new UINumberWithMeasurement({
            value: 0,
            step: 0.1,
            min: 0,
            max: 360,
            measurementName: `Angle`
        });
        prop.fallingPosition = new UINumberWithMeasurement({
            value: 180,
            step: 0.1,
            min: 0,
            max: 360,
            measurementName: `Angle`
        });
        this.Setup(prop);
        this.length.value = 8;
    }

    GetObjOperation(result) {
        let obj = this.value
        obj.result = result

        return obj
    }
}
ReluctorConfigs.push(Reluctor_Universal1x);
customElements.define(`reluctor-universal1x`, Reluctor_Universal1x, { extends: `span` });