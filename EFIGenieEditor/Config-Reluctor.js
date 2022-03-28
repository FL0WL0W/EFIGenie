var ReluctorConfigs = [];
InputConfigs.unshift({Group: `Reluctor Decoders`, Configs: ReluctorConfigs});

ReluctorFactoryIDs = {
    Offset: 30000,
    GM24X: 1,
    Universal1X: 2,
    UniversalMissintTooth: 3
};

class Reluctor_Template extends Input_DigitalRecord {
    static Output = `ReluctorResult`;
    static Measurement = `Reluctor`;
    static Inputs = [];
    static Template = Input_DigitalRecord.Template.substring(0, Input_DigitalRecord.Template.lastIndexOf(`Inverted`) + 8)

    GetObjOperation(objOperation) {
        return { type: `Group`, value: [
            super.GetObjOperation(`${this.ReferenceName}(Reluctor)`),
            objOperation
        ]};
    }
}
customElements.define(`reluctor-template`, Reluctor_Template, { extends: `div` });

class Reluctor_GM24x extends Reluctor_Template {
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
customElements.define(`reluctor-gm24x`, Reluctor_GM24x, { extends: `div` });

class Reluctor_Universal1x extends Reluctor_Template {
    static Name = `Reluctor Universal 1X`;
    static Template =   Reluctor_Template.Template +
                        `<br/><label>Rising Edge Position:</label><div data-element="RisingPosition"></div>` +
                        `<br/><label>Falling Edge Position:</label><div data-element="FallingPosition"></div>`;
    constructor(prop){
        super();
        prop.RisingPosition = new UI.NumberWithMeasurement({
            Value: 0,
            step: 0.1,
            min: 0,
            max: 360,
            Measurement: `Angle`
        });
        prop.FallingPosition = new UI.NumberWithMeasurement({
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
customElements.define(`reluctor-universal1x`, Reluctor_Universal1x, { extends: `div` });

class Reluctor_UniversalMissingTeeth extends Reluctor_Template {
    static Name = `Reluctor Universal Missing Teeth`;
    static Template =   Reluctor_Template.Template +
                        `<br/><label>First Tooth Position:</label><div data-element="FirstToothPosition"></div>(Falling Edge)` +
                        `<br/><label>Tooth Width:</label><div data-element="ToothWidth"></div>` +
                        `<br/><label>Number of Teeth:</label><div data-element="NumberOfTeeth"></div>` +
                        `<br/><label>Number of Teeth Missing:</label><div data-element="NumberOfTeethMissing"></div>`;

    constructor(prop){
        super()
        this.FirstToothPosition = new UI.NumberWithMeasurement({
            Value: 0,
            step: 0.1,
            min: 0,
            max: 360,
            Measurement: `Angle`
        });
        this.ToothWidth = new UI.NumberWithMeasurement({
            Value: 5,
            step: 0.1,
            min: 0,
            max: 360,
            Measurement: `Angle`
        });
        this.NumberOfTeeth = new UI.Number({
            Value: 36,
            min: 2
        });
        this.NumberOfTeethMissing = new UI.Number({
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
customElements.define(`reluctor-universalmissingteeth`, Reluctor_UniversalMissingTeeth, { extends: `div` });