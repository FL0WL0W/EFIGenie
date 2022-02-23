class Reluctor_GM24x {
    static Name = `Reluctor GM 24X`;
    static Output = `ReluctorResult`;
    static Inputs = [`Record`];
    static Measurement = `Reluctor`;

    GetHtml() { return ``; }

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: EmbeddedOperationsFactoryIDs.Offset + EmbeddedOperationsFactoryIDs.PulseWidthPinRead}, //factory ID
            { type: `UINT16`, value: this.Pin.Value}, //pin
            { type: `UINT16`, value: this.MinFrequency.Value}, //minFrequency
        ]};

        if (outputVariableId || inputVariableId) 
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ?? 0 ], 
                inputVariables: [ inputVariableId ?? 0 ]
            });

        return objOperation;
    }
}
InputConfigs.push(Reluctor_GM24x);

class Reluctor_Universal1x extends UITemplate {
    static Name = `Reluctor Universal 1X`;
    static Output = `Reluctor`;
    static Inputs = [`Record`];
    static Measurement = `ReluctorResult`;
    static Template =   `<div><label for="$RisingPosition.GUID$">Rising Edge Position:</label>$RisingPosition$</div>` +
                        `<div><label for="$FallingPosition.GUID$">Falling Edge Position:</label>$FallingPosition$</div>`;

    constructor(prop){
        prop ??= {};
        prop.RisingPosition = new UINumberWithMeasurement({
            Value: 0,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        prop.FallingPosition = new UINumberWithMeasurement({
            Value: 180,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        super(prop);
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [ 
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.Universal1X}, //factory ID
            { type: `FLOAT`, value: this.RisingPosition.Value}, //RisingPosition
            { type: `FLOAT`, value: this.FallingPosition.Value} //FallingPosition
        ]};
            
        return Packagize(objOperation, { 
            outputVariables: [ outputVariableId ?? 0 ],
            inputVariables: [ 
                inputVariableId ?? 0,
                `CurrentTickId`
            ]
        });
    }
}
InputConfigs.push(Reluctor_Universal1x);

class Reluctor_UniversalMissingTeeth extends UITemplate {
    static Name = `Reluctor Universal Missing Teeth`;
    static Output = `Reluctor`;
    static Inputs = [`Record`];
    static Measurement = `ReluctorResult`;
    static Template =   `<div><label for="$FirstToothPosition.GUID$">First Tooth Position:</label>$FirstToothPosition$(Falling Edge)</div>` +
                        `<div><label for="$ToothWidth.GUID$">Tooth Width:</label>$ToothWidth$</div>` +
                        `<div><label for="$NumberOfTeeth.GUID$">Number of Teeth:</label>$NumberOfTeeth$</div>` +
                        `<div><label for="$NumberOfTeethMissing.GUID$">Number of Teeth Missing:</label>$NumberOfTeethMissing$</div>`;

    constructor(prop){
        prop ??= {};
        prop.FirstToothPosition = new UINumberWithMeasurement({
            Value: 0,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        prop.ToothWidth = new UINumberWithMeasurement({
            Value: 5,
            Step: 0.1,
            Min: 0,
            Max: 360,
            Measurement: `Angle`
        });
        prop.NumberOfTeeth = new UINumber({
            Value: 36,
            Min: 2
        });
        prop.NumberOfTeethMissing = new UINumber({
            Value: 1,
            Min: 1
        });
        super(prop);
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [ 
            { type: `UINT32`, value: ReluctorFactoryIDs.Offset + ReluctorFactoryIDs.UniversalMissintTooth}, //factory ID
            { type: `FLOAT`, value: this.FirstToothPosition.Value}, //FirstToothPosition
            { type: `FLOAT`, value: this.ToothWidth.Value}, //ToothWidth
            { type: `UINT8`, value: this.NumberOfTeeth.Value}, //NumberOfTeeth
            { type: `UINT8`, value: this.NumberOfTeethMissing.Value} //NumberOfTeethMissing
        ]};
            
        return Packagize(objOperation, { 
            outputVariables: [ outputVariableId ?? 0 ],
            inputVariables: [ 
                inputVariableId ?? 0,
                `CurrentTickId`
            ]
        });
    }
}
InputConfigs.push(Reluctor_UniversalMissingTeeth);