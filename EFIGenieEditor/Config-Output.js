var BooleanOutputConfigs = [];

class Output_Digital extends UI.Template {
    static Name = `Digital Pin`;
    static Inputs = [`bool`];
    static Template =   `<label>Pin:</label><div data-element="Pin"></div><div data-element="Inverted"></div>Inverted <div data-element="HighZ"></div>High Z`;

    constructor(prop){
        super();
        this.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: `digital`
        });
        this.Inverted = new UI.CheckBox();
        this.HighZ = new UI.CheckBox();
        this.style.display = `block`;
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
customElements.define(`output-digital`, Output_Digital, { extends: `span` });