import UITemplate from "../JavascriptUI/UITemplate.js"
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_Analog extends UITemplate {
    static displayName = `Analog Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Voltage`;
    static Template = `<label>Pin:</label><div data-element="pin"></div>`

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

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.AnalogInput}, //factory ID
            { type: `UINT16`, value: this.value.pin}, //pin
        ]};

        if (outputVariableId)
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
customElements.define(`input-analog`, Input_Analog, { extends: `span` });
RawInputConfigs.push(Input_Analog);