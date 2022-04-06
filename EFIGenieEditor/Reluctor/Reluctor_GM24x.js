import Reluctor_Template from "./Reluctor_Template.js";
export default class Reluctor_GM24x extends Reluctor_Template {
    static Name = `Reluctor GM 24X`;

    constructor(prop) {
        super(prop);
        this.Length.Value = 100;
    }

    GetObjOperation(outputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.GM24X}, //factory ID
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
ReluctorConfigs.push(Reluctor_GM24x);
customElements.define(`reluctor-gm24x`, Reluctor_GM24x, { extends: `span` });