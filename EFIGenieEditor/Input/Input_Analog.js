import UITemplate from "../JavascriptUI/UITemplate.js"
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_Analog extends UITemplate {
    static displayName = `Analog Pin`;
    static output = `float`;
    static inputs = [];
    static measurementName = `Voltage`;
    static template = `<label>Pin:</label><div data-element="pin"></div>`

    get value() { return { ...super.value, type: "Input_Analog" } }
    set value(value) { super.value = value }

    constructor(prop){
        super();
        this.pin = new UIPinSelection({
            value: 0xFFFF,
            pinType: `analog`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }
}
customElements.define(`input-analog`, Input_Analog, { extends: `span` });
RawInputConfigs.push(Input_Analog);