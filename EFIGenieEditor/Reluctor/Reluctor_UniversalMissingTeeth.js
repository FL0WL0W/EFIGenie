import Reluctor_Template from "./Reluctor_Template.js";
import UINumber from "../JavascriptUI/UINumber.js";
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class Reluctor_UniversalMissingTeeth extends Reluctor_Template {
    static displayName = `Reluctor Universal Missing Teeth`;
    static Template =   Reluctor_Template.Template +
                        `<br/><label>First Tooth Position:</label><div data-element="firstToothPosition"></div>(Falling Edge)` +
                        `<br/><label>Tooth Width:</label><div data-element="toothWidth"></div>` +
                        `<br/><label>Number of Teeth:</label><div data-element="numberOfTeeth"></div>` +
                        `<br/><label>Number of Teeth Missing:</label><div data-element="numberOfTeethMissing"></div>`;

    constructor(prop){
        super()
        this.firstToothPosition = new UINumberWithMeasurement({
            value: 0,
            step: 0.1,
            min: 0,
            max: 360,
            measurementName: `Angle`
        });
        this.toothWidth = new UINumberWithMeasurement({
            value: 5,
            step: 0.1,
            min: 0,
            max: 360,
            measurementName: `Angle`
        });
        this.length.value = 72;
        this.numberOfTeeth = new UINumber({
            value: 36,
            min: 2
        });
        const thisClass = this;
        this.numberOfTeeth.addEventListener(`change`, function() {
            thisClass.length.value = thisClass.NumberOfTeeth.value * 2;
        });
        this.numberOfTeethMissing = new UINumber({
            value: 1,
            min: 1
        });
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [ 
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.UniversalMissintTooth}, //factory ID
            { type: `FLOAT`, value: this.value.firstToothPosition}, //FirstToothPosition
            { type: `FLOAT`, value: this.value.toothWidth}, //ToothWidth
            { type: `UINT8`, value: this.value.numberOfTeeth}, //NumberOfTeeth
            { type: `UINT8`, value: this.value.numberOfTeethMissing} //NumberOfTeethMissing
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