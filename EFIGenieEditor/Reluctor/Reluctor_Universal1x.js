import Reluctor_Template from "./Reluctor_Template.js";
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class Reluctor_Universal1x extends Reluctor_Template {
    static Name = `Reluctor Universal 1X`;
    static Template =   Reluctor_Template.Template +
                        `<br/><label>Rising Edge Position:</label><div data-element="RisingPosition"></div>` +
                        `<br/><label>Falling Edge Position:</label><div data-element="FallingPosition"></div>`;
    constructor(prop){
        super();
        prop.RisingPosition = new UINumberWithMeasurement({
            Value: 0,
            step: 0.1,
            min: 0,
            max: 360,
            Measurement: `Angle`
        });
        prop.FallingPosition = new UINumberWithMeasurement({
            Value: 180,
            step: 0.1,
            min: 0,
            max: 360,
            Measurement: `Angle`
        });
        this.Setup(prop);
        this.Length.Value = 4;
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [ 
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.Universal1X}, //factory ID
            { type: `FLOAT`, value: this.RisingPosition.Value}, //RisingPosition
            { type: `FLOAT`, value: this.FallingPosition.Value} //FallingPosition
        ]};
        obj =  Packagize(obj, { 
            outputVariables: [ outputVariableId ?? 0 ], 
            inputVariables: [ 
                `${this.ReferenceName}(Reluctor)`,
                `CurrentTickId`
            ]
        });
        return super.GetObjOperation({ obj });
    }
}
ReluctorConfigs.push(Reluctor_Universal1x);
customElements.define(`reluctor-universal1x`, Reluctor_Universal1x, { extends: `span` });