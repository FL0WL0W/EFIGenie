import Reluctor_Template from "./Reluctor_Template.js";
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class Reluctor_Universal1x extends Reluctor_Template {
    static displayName = `Reluctor Universal 1X`;
    static template =   Reluctor_Template.template +
                        `<br/><label>Rising Edge Position:</label><div data-element="risingPosition"></div>` +
                        `<br/><label>Falling Edge Position:</label><div data-element="fallingPosition"></div>`;
    constructor(prop){
        super();
        prop.risingPosition = new UINumberWithMeasurement({
            value: 0,
            step: 0.1,
            min: 0,
            max: 360,
            measurementName: `Angle`
        });
        prop.fallingPosition = new UINumberWithMeasurement({
            value: 180,
            step: 0.1,
            min: 0,
            max: 360,
            measurementName: `Angle`
        });
        this.Setup(prop);
        this.length.value = 4;
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [ 
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.Universal1X}, //factory ID
            { type: `FLOAT`, value: this.value.risingPosition}, //RisingPosition
            { type: `FLOAT`, value: this.value.fallingPosition} //FallingPosition
        ]};
        obj =  Packagize(obj, { 
            outputVariables: [ outputVariableId ?? 0 ], 
            inputVariables: [ 
                `${this.referenceName}(Reluctor)`,
                `CurrentTickId`
            ]
        });
        return super.GetObjOperation({ obj });
    }
}
ReluctorConfigs.push(Reluctor_Universal1x);
customElements.define(`reluctor-universal1x`, Reluctor_Universal1x, { extends: `span` });