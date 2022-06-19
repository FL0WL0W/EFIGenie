import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_Frequency extends UITemplate {
    static displayName = `Frequency Pin`;
    static output = `float`;
    static inputs = [];
    static measurementName = `Frequency`;
    static template =   `<label>Pin:</label><div data-element="pin"></div>` +
                        `<br/><label>Minimum Frequency:</label><div data-element="minFrequency"></div>`

    constructor(prop){
        super();
        this.pin = new UIPinSelection({
            value: 0xFFFF,
            pinType: `pwm`
        });
        this.minFrequency = new UINumberWithMeasurement({
            value: 1000,
            step: 1,
            min: 0,
            max: 65535,
            measurementName: `Frequency`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(result) {
        let obj = this.value
        obj.type = `Input_Frequency`
        obj.result = result

        return obj
    }
}
RawInputConfigs.push(Input_Frequency);
customElements.define(`input-frequency`, Input_Frequency, { extends: `span` });