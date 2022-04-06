import UITemplate from "../JavascriptUI/UITemplate.js"
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_Analog extends UITemplate {
    static Name = `Analog Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Voltage`;
    static Template = `<label>Pin:</label><div data-element="Pin"></div>`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `analog`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.AnalogInput}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
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