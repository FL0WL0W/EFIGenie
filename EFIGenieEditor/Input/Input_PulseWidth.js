import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_PulseWidth extends UITemplate {
    static displayName = `Pulse Width Pin`;
    static output = `float`;
    static inputs = [];
    static measurementName = `Time`;
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
}
RawInputConfigs.push(Input_PulseWidth);
customElements.define(`input-pulsewidth`, Input_PulseWidth, { extends: `span` });