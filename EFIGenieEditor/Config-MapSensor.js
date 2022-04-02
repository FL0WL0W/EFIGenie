var MapConfigs = [];
InputConfigs.unshift({Group: `MAP Sensors`, Configs: MapConfigs});

class Input_AnalogPolynomial extends UI.Template {
    static Template = `<div data-element="VoltageLiveUpdate"></div><div data-element="AnalogInput"></div>`
    static Output = `float`;
    static Inputs = [];

    constructor(prop){
        super();
        this.AnalogInput = new Input_Analog();
        this.Polynomial = new Calculation_Polynomial();
        this.VoltageLiveUpdate = new DisplayLiveUpdate({
            Measurement: Input_Analog.Measurement
        });
        this.VoltageLiveUpdate.style.float = `right`;
        this.Setup(prop);
        this.style.display = `block`;
    }

    RegisterVariables() {
        VariableRegister.RegisterVariable(
            `${this.ReferenceName}(Voltage)`,
            `float`
        );
        this.VoltageLiveUpdate.VariableReference = `${this.ReferenceName}(Voltage)`;
        this.VoltageLiveUpdate.RegisterVariables();
    }

    GetObjOperation(outputVariableId) {
        return { type: `Group`, value: [
            this.AnalogInput.GetObjOperation(`${this.ReferenceName}(Voltage)`),
            this.Polynomial.GetObjOperation(outputVariableId, `${this.ReferenceName}(Voltage)`)
        ]};
    }
}
customElements.define(`input-analogpolynomial`, Input_AnalogPolynomial, { extends: `div` });

class MAP_GM1Bar extends Input_AnalogPolynomial {
    static Name = `GM 1 Bar MAP`;
    static Measurement = `Pressure`;

    get saveValue() { return this.AnalogInput.saveValue; }
    set saveValue(saveValue) { return this.AnalogInput.saveValue = saveValue; }

    constructor(prop) {
        super(prop);
        // this.Polynomial.Hide();
        this.Polynomial.minValue = 0.1;
        this.Polynomial.maxValue = 1.05;
        let value = [];
        value[0] = 0.101515151515152;
        value[1] = 0.18987012987013;
        this.Polynomial.value = value;
    }
}
MapConfigs.push(MAP_GM1Bar);
customElements.define(`map-gm1bar`, MAP_GM1Bar, { extends: `div` });

class MAP_GM2Bar extends Input_AnalogPolynomial {
    static Name = `GM 2 Bar MAP`;
    static Measurement = `Pressure`;

    get saveValue() { return this.AnalogInput.saveValue; }
    set saveValue(saveValue) { return this.AnalogInput.saveValue = saveValue; }

    constructor(prop) {
        super(prop);
        // this.Polynomial.Hide();
        this.Polynomial.minValue = 0.088;
        this.Polynomial.maxValue = 2.08;
        let value = [];
        value[0] = 0.082718614718615;
        value[1] = 0.398493506493506;
        this.Polynomial.value = value;
    }
}
MapConfigs.push(MAP_GM2Bar);
customElements.define(`map-gm2bar`, MAP_GM2Bar, { extends: `div` });

class MAP_GM3Bar extends Input_AnalogPolynomial {
    static Name = `GM 3 Bar MAP`;
    static Measurement = `Pressure`;

    get saveValue() { return this.AnalogInput.saveValue; }
    set saveValue(saveValue) { return this.AnalogInput.saveValue = saveValue; }

    constructor(prop) {
        super(prop);
        // this.Polynomial.Hide();
        this.Polynomial.minValue = 0.036;
        this.Polynomial.maxValue = 3.15;
        let value = [];
        value[0] = 0.016952380952381;
        value[1] = 0.628;
        this.Polynomial.value = value;
    }
}
MapConfigs.push(MAP_GM3Bar);
customElements.define(`map-gm3bar`, MAP_GM3Bar, { extends: `div` });