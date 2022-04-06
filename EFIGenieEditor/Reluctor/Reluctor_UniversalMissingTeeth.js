import Reluctor_Template from "./Reluctor_Template.js";
import UINumber from "../JavascriptUI/UINumber.js";
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class Reluctor_UniversalMissingTeeth extends Reluctor_Template {
    static Name = `Reluctor Universal Missing Teeth`;
    static Template =   Reluctor_Template.Template +
                        `<br/><label>First Tooth Position:</label><div data-element="FirstToothPosition"></div>(Falling Edge)` +
                        `<br/><label>Tooth Width:</label><div data-element="ToothWidth"></div>` +
                        `<br/><label>Number of Teeth:</label><div data-element="NumberOfTeeth"></div>` +
                        `<br/><label>Number of Teeth Missing:</label><div data-element="NumberOfTeethMissing"></div>`;

    constructor(prop){
        super()
        this.FirstToothPosition = new UINumberWithMeasurement({
            Value: 0,
            step: 0.1,
            min: 0,
            max: 360,
            Measurement: `Angle`
        });
        this.ToothWidth = new UINumberWithMeasurement({
            Value: 5,
            step: 0.1,
            min: 0,
            max: 360,
            Measurement: `Angle`
        });
        this.NumberOfTeeth = new UINumber({
            Value: 36,
            min: 2
        });
        this.NumberOfTeethMissing = new UINumber({
            Value: 1,
            min: 1
        });
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [ 
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.UniversalMissintTooth}, //factory ID
            { type: `FLOAT`, value: this.FirstToothPosition.Value}, //FirstToothPosition
            { type: `FLOAT`, value: this.ToothWidth.Value}, //ToothWidth
            { type: `UINT8`, value: this.NumberOfTeeth.Value}, //NumberOfTeeth
            { type: `UINT8`, value: this.NumberOfTeethMissing.Value} //NumberOfTeethMissing
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
ReluctorConfigs.push(Reluctor_UniversalMissingTeeth);
customElements.define(`reluctor-universalmissingteeth`, Reluctor_UniversalMissingTeeth, { extends: `span` });