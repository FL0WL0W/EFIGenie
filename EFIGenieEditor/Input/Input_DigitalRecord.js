import UITemplate from "../JavascriptUI/UITemplate.js"
import UICheckBox from "../JavascriptUI/UICheckBox.js";
import UINumber from "../JavascriptUI/UINumber.js";
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_DigitalRecord extends UITemplate {
    static Name = `Digital Pin (Record)`;
    static Output = `Record`;
    static Inputs = [];
    static Measurement = `Record`;
    static Template =   `<label>Pin:</label><div data-element="Pin"></div><div data-element="Inverted"></div>Inverted` +
                        `<br/><label>Length:</label><div data-element="Length"></div>`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `digitalinterrupt`
        });
        this.Inverted = new UICheckBox();
        this.Length = new UINumber ({
            Value: 2,
            step: 1,
            min: 1,
            max: 1000
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalPinRecord}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `BOOL`, value: this.Inverted.Value}, //inverted
            { type: `UINT16`, value: this.Length.Value}, //length
        ]};

        if (outputVariableId) 
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
RawInputConfigs.push(Input_DigitalRecord);
customElements.define(`input-digitalrecord`, Input_DigitalRecord, { extends: `span` });