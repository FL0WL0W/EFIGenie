import Reluctor_Template from "./Reluctor_Template.js";
export default class Reluctor_GM24x extends Reluctor_Template {
    static displayName = `Reluctor GM 24X`;

    constructor(prop) {
        super(prop);
        this.length.value = 100;
    }

    GetObjOperation(result) {
        var obj = { value: [
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.GM24X}, //factory ID
        ]};
        obj =  Packagize(obj, { 
            outputVariables: [ `${result}(Reluctor)` ], 
            inputVariables: [ 
                `${result}(Record)`,
                `CurrentTickId`
            ]
        });
        return super.GetObjOperation(result, { obj });
    }
}
ReluctorConfigs.push(Reluctor_GM24x);
customElements.define(`reluctor-gm24x`, Reluctor_GM24x, { extends: `span` });