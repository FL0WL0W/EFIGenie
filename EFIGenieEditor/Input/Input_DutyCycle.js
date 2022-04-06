import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
import UIPinSelection from "../UI/UIPinSelection.js";
export default class Input_DutyCycle extends UITemplate {
    static displayName = `Duty Cycle Pin Pin`;
    static output = `float`;
    static inputs = [];
    static measurementName = `Percentage`;
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

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DutyCyclePinRead}, //factory ID
            { type: `UINT16`, value: this.value.pin}, //pin
            { type: `UINT16`, value: this.value.minFrequency}, //minFrequency
        ]};

        if (outputVariableId) 
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ] 
            });

        return obj;
    }
}
RawInputConfigs.push(Input_DutyCycle);
customElements.define(`input-dutycycle`, Input_DutyCycle, { extends: `span` });