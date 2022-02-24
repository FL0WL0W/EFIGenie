var MapConfigs = [];
InputConfigs.unshift({Group: `MAP Sensors`, Configs: MapConfigs});

class Input_AnalogPolynomial extends UITemplate {
    static Template = `<div><span style="float: right;">$VoltageLiveUpdate$</span>$AnalogInput$</div>`//$Polynomial$</div>`
    static Output = `float`;
    static Inputs = [];

    constructor(prop){
        prop ??= {};
        prop.AnalogInput = new Input_Analog();
        prop.Polynomial = new Calculation_Polynomial();
        prop.VoltageLiveUpdate = new DisplayLiveUpdate({
            Measurement: Input_Analog.Measurement
        });
        super(prop);
    }

    RegisterVariables() {
        VariableRegister.RegisterVariable(
            `${this.ReferenceName}(Voltage)`,
            type
        );
        this.VoltageLiveUpdate.VariableReference = `${this.ReferenceName}(Voltage)`;
    }

    GetObjOperation(outputVariableId) {
        return { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Group }, // Group
            { type: `UINT16`, value: 2 }, // number of operations
            { obj: this.AnalogInput.GetObjOperation(`${this.ReferenceName}(Voltage)`) },
            { obj: this.Polynomial.GetObjOperation(outputVariableId, `${this.ReferenceName}(Voltage)`) }
        ]};
    }
}

class MAP_GM1Bar extends Input_AnalogPolynomial {
    static Name = `GM 1 Bar MAP`;
    static Measurement = `Pressure`;

    GetValue() { return this.AnalogInput.GetValue(); }
    SetValue(value) { return this.AnalogInput.SetValue(value); }

    constructor(prop) {
        super(prop);
        // this.Polynomial.Hide();
        this.Polynomial.MinValue = 0.1;
        this.Polynomial.MaxValue = 1.05;
        this.Polynomial.Degree = 2;
        this.Polynomial.A[0] = 0.101515151515152;
        this.Polynomial.A[1] = 0.18987012987013;
    }
}
MapConfigs.push(MAP_GM1Bar);

class MAP_GM2Bar extends Input_AnalogPolynomial {
    static Name = `GM 2 Bar MAP`;
    static Measurement = `Pressure`;

    GetValue() { return this.AnalogInput.GetValue(); }
    SetValue(value) { return this.AnalogInput.SetValue(value); }

    constructor(prop) {
        super(prop);
        // this.Polynomial.Hide();
        this.Polynomial.MinValue = 0.088;
        this.Polynomial.MaxValue = 2.08;
        this.Polynomial.Degree = 2;
        this.Polynomial.A[0] = 0.082718614718615;
        this.Polynomial.A[1] = 0.398493506493506;
    }
}
MapConfigs.push(MAP_GM2Bar);

class MAP_GM3Bar extends Input_AnalogPolynomial {
    static Name = `GM 3 Bar MAP`;
    static Measurement = `Pressure`;

    GetValue() { return this.AnalogInput.GetValue(); }
    SetValue(value) { return this.AnalogInput.SetValue(value); }

    constructor(prop) {
        super(prop);
        // this.Polynomial.Hide();
        this.Polynomial.MinValue = 0.036;
        this.Polynomial.MaxValue = 3.15;
        this.Polynomial.Degree = 2;
        this.Polynomial.A[0] = 0.016952380952381;
        this.Polynomial.A[1] = 0.628;
    }
}
MapConfigs.push(MAP_GM3Bar);