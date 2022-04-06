import Input_AnalogPolynomial from "../Input/Input_AnalogPolynomial.js";
export default class MAP_GM1Bar extends Input_AnalogPolynomial {
    static Name = `GM 1 Bar MAP`;
    static Measurement = `Pressure`;

    get saveValue() { return this.AnalogInput.saveValue; }
    set saveValue(saveValue) { return this.AnalogInput.saveValue = saveValue; }

    constructor(prop) {
        super(prop);
        this.Polynomial.hidden = true;
        this.Polynomial.minValue = 0.1;
        this.Polynomial.maxValue = 1.05;
        let value = [];
        value[0] = 0.101515151515152;
        value[1] = 0.18987012987013;
        this.Polynomial.value = value;
    }
}
MapConfigs.push(MAP_GM1Bar);
customElements.define(`map-gm1bar`, MAP_GM1Bar, { extends: `span` });