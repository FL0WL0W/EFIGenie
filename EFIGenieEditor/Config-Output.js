var BooleanOutputConfigs = [];

class Output_Digital extends UI.OldTemplate {
    static Name = `Digital Pin`;
    static Inputs = [`bool`];
    static Template = `<div><label>Pin:</label>$Pin$$Inverted$Inverted $HighZ$High Z</div>`

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `digital`
        });
        this.Inverted = new UI.OldCheckbox();
        this.HighZ = new UI.OldCheckbox();
        this.Setup(prop);
    }

    GetObjOperation(inputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalOutput }, //variable
            { type: `UINT16`, value: this.Pin.Value },
            { type: `UINT8`, value: this.Inverted.Value | (this.HighZ.Value? 0x02 : 0x00) }
        ]};

        if (inputVariableId) {
            obj = Packagize(obj, {
                inputVariables: [ inputVariableId ]
            })
        }

        return obj;
    }
}
BooleanOutputConfigs.push(Output_Digital);