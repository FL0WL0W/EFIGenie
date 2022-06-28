import UITemplate from "../JavascriptUI/UITemplate.js"
import UICheckBox from "../JavascriptUI/UICheckBox.js";
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_Digital extends UITemplate {
    static displayName = `Digital Pin`;
    static output = `bool`;
    static inputs = [];
    static measurementName = `Bool`;
    static template = `<label>Pin:</label><div data-element="pin"></div><div data-element="inverted"></div>Inverted`;

    get value() { return { ...super.value, type: "Input_Digital" } }
    set value(value) { super.value = value }

    constructor(prop){
        super();
        this.pin = new UIPinSelection({
            value: 0xFFFF,
            pinType: `digital`
        });
        this.inverted = new UICheckBox();
        this.style.display = `block`;
        this.Setup(prop);
    }
}
RawInputConfigs.push(Input_Digital);
customElements.define(`input-digital`, Input_Digital, { extends: `span` });