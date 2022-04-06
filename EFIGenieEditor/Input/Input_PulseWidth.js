import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_PulseWidth extends UITemplate {
    static Name = `Pulse Width Pin`;
    static Output = `float`;
    static Inputs = [];
    static Measurement = `Time`;
    static Template =   `<label>Pin:</label><div data-element="Pin"></div>` +
                        `<br/><label>Minimum Frequency:</label><div data-element="MinFrequency"></div>`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `pwm`
        });
        this.MinFrequency = new UINumberWithMeasurement({
            Value: 1000,
            step: 1,
            min: 0,
            max: 65535,
            Measurement: `Frequency`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.PulseWidthPinRead}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `UINT16`, value: this.MinFrequency.Value}, //minFrequency
        ]};

        if (outputVariableId) 
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
RawInputConfigs.push(Input_PulseWidth);
customElements.define(`input-pulsewidth`, Input_PulseWidth, { extends: `span` });