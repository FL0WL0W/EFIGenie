var BooleanOutputConfigs = [];

class ConfigOperation_DigitalPinWrite extends UITemplate {
    static Name = "Digital Pin";
    static Inputs = ["bool"];
    static Template =   "<div><label for=\"$Pin.GUID$\">Pin:</label>$Pin$$Inverted$Inverted $HighZ$High Z</div>"

    constructor(prop){
        prop = prop === undefined? {} : prop;
        prop.Pin = new UIPinSelection({
            Value: 0xFFFF,
            PinType: "digital"
        });
        prop.Inverted = new UICheckbox();
        prop.HighZ = new UICheckbox();
        super(prop);
    }

    GetObjOperation() {
        return { value: [
            { type: "UINT32", value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.DigitalOutput }, //variable
            { type: "UINT16", value: this.GetValue().Pin },
            { type: "UINT8", value: this.GetValue().Inverted | (this.GetValue().HighZ? 0x02 : 0x00) }
        ]};
    }
}
BooleanOutputConfigs.push(ConfigOperation_DigitalPinWrite);