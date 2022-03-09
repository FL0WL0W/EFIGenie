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
    static Template = Input_DigitalRecord.Template.substring(0, Input_DigitalRecord.Template.indexOf(`Inverted</div>`) + 14)

    GetObjOperation(objOperation) {
        return { type: `Group`, value: [
            super.GetObjOperation(`${this.ReferenceName}(Reluctor)`),
            objOperation
        ]};
    }
}

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

class Reluctor_Universal1x extends Reluctor_Template {
    static Name = `Reluctor Universal 1X`;
    static Template =   Reluctor_Template.Template +
                        `<div><label for="$RisingPosition.GUID$">Rising Edge Position:</label>$RisingPosition$</div>` +
                        `<div><label for="$FallingPosition.GUID$">Falling Edge Position:</label>$FallingPosition$</div>`;
    constructor(prop){
        super();
        this.RisingPosition = new UI.OldNumberWithMeasurement({
            Value: 0,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        this.FallingPosition = new UI.OldNumberWithMeasurement({
            Value: 180,
            Step: 0.1,
            Min: 0,
            Max: 360,
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

class Reluctor_UniversalMissingTeeth extends Reluctor_Template {
    static Name = `Reluctor Universal Missing Teeth`;
    static Template =   Reluctor_Template.Template +
                        `<div><label for="$FirstToothPosition.GUID$">First Tooth Position:</label>$FirstToothPosition$(Falling Edge)</div>` +
                        `<div><label for="$ToothWidth.GUID$">Tooth Width:</label>$ToothWidth$</div>` +
                        `<div><label for="$NumberOfTeeth.GUID$">Number of Teeth:</label>$NumberOfTeeth$</div>` +
                        `<div><label for="$NumberOfTeethMissing.GUID$">Number of Teeth Missing:</label>$NumberOfTeethMissing$</div>`;

    constructor(prop){
        super()
        this.FirstToothPosition = new UI.OldNumberWithMeasurement({
            Value: 0,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        this.ToothWidth = new UI.OldNumberWithMeasurement({
            Value: 5,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        this.NumberOfTeeth = new UI.OldNumber({
            Value: 36,
            Min: 2
        });
        this.NumberOfTeethMissing = new UI.OldNumber({
            Value: 1,
            Min: 1
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