import UITemplate from "../JavascriptUI/UITemplate.js"
import UIPinSelection from "../UI/UIPinSelection.js";
import UICheckBox from "../JavascriptUI/UICheckBox.js";
export default class Output_Digital extends UITemplate {
    static displayName = `Digital Pin`;
    static inputs = [`bool`];
    static template =   `<label>Pin:</label><div data-element="pin"></div><div data-element="inverted"></div>Inverted <div data-element="highZ"></div>High Z`;

    get saveValue() {
        return super.saveValue;
    }
    set saveValue(saveValue) {
        saveValue.pin ??= saveValue.Pin;
        saveValue.inverted ??= saveValue.Inverted;
        saveValue.highZ ??= saveValue.HighZ;
        super.saveValue = saveValue;
    }

    constructor(prop){
        super();
        this.pin = new UIPinSelection({
            value: 0xFFFF,
            pinType: `digital`
        });
        this.inverted = new UICheckBox();
        this.highZ = new UICheckBox();
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(inputVariableId) {
        let obj = this.value
        obj.type = `Output_Digital`
        obj.inputVariables = [ inputVariableId ]

        return obj
    }
}
BooleanOutputConfigs.push(Output_Digital);
customElements.define(`output-digital`, Output_Digital, { extends: `span` });