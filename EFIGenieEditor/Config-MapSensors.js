class ConfigOperation_GM1BarMAP {
    static Name = `GM 1 Bar MAP`;
    static Output = `float`;
    static Inputs = [`float`];
    static Measurement = `Pressure`;

    GetHtml() { return `` }

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: `FLOAT`, value: 0.1}, //MinValue
            { type: `FLOAT`, value: 1.05}, //MaxValue
            { type: `UINT8`, value: 2}, //Degree
            { type: `FLOAT`, value: 0.101515151515152}, //coefficients
            { type: `FLOAT`, value: 0.18987012987013}, //coefficients
        ]};

        if (outputVariableId || inputVariableId) 
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables: [ inputVariableId ?? 0 ]
            });

        return objOperation;
    }
}
InputConfigs.push(ConfigOperation_GM1BarMAP);

class ConfigOperation_GM2BarMAP {
    static Name = `GM 2 Bar MAP`;
    static Output = `float`;
    static Inputs = [`float`];
    static Measurement = `Pressure`;

    GetHtml() { return `` }

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: `FLOAT`, value: 0.088}, //MinValue
            { type: `FLOAT`, value: 2.08}, //MaxValue
            { type: `UINT8`, value: 2}, //Degree
            { type: `FLOAT`, value: 0.082718614718615}, //coefficients
            { type: `FLOAT`, value: 0.398493506493506}, //coefficients
        ]};

        if (outputVariableId || inputVariableId) 
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables: [ inputVariableId ?? 0 ]
            });

        return objOperation;
    }
}
InputConfigs.push(ConfigOperation_GM2BarMAP);

class ConfigOperation_GM3BarMAP {
    static Name = `GM 3 Bar MAP`;
    static Output = `float`;
    static Inputs = [`float`];
    static Measurement = `Pressure`;

    GetHtml() { return `` }

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: `FLOAT`, value: 0.036}, //MinValue
            { type: `FLOAT`, value: 3.15}, //MaxValue
            { type: `UINT8`, value: 2}, //Degree
            { type: `FLOAT`, value: 0.016952380952381}, //coefficients
            { type: `FLOAT`, value: 0.628}, //coefficients
        ]};

        if (outputVariableId || inputVariableId) 
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables: [ inputVariableId ?? 0 ]
            });

        return objOperation;
    }
}
InputConfigs.push(ConfigOperation_GM3BarMAP);