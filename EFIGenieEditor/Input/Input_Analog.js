import UITemplate from "../JavascriptUI/UITemplate.js"
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_Analog extends UITemplate {
    static displayName = `Analog Pin`;
    static output = `float`;
    static inputs = [];
    static measurementName = `Voltage`;
    static template = `<label>Pin:</label><div data-element="pin"></div>`

    get saveValue() {
        return super.saveValue;
    }
    set saveValue(saveValue) {
        saveValue.pin ??= saveValue.Pin;
        super.saveValue = saveValue;
    }

    constructor(prop){
        super();
        this.pin = new UIPinSelection({
            value: 0xFFFF,
            pinType: `analog`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(result) {
        let obj = this.value
        obj.type = `Input_Analog`
        obj.result = result

        return obj
    }
}
customElements.define(`input-analog`, Input_Analog, { extends: `span` });
RawInputConfigs.push(Input_Analog);