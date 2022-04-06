import UITemplate from "../JavascriptUI/UITemplate.js"
import UICheckBox from "../JavascriptUI/UICheckBox.js";
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_Digital extends UITemplate {
    static Name = `Digital Pin`;
    static Output = `bool`;
    static Inputs = [];
    static Measurement = `Bool`;
    static Template = `<label>Pin:</label><div data-element="Pin"></div><div data-element="Inverted"></div>Inverted`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `digital`
        });
        this.Inverted = new UICheckBox();
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalInput}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `BOOL`, value: this.Inverted.Value}, //inverted
        ]};

        if (outputVariableId)
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
RawInputConfigs.push(Input_Digital);
customElements.define(`input-digital`, Input_Digital, { extends: `span` });