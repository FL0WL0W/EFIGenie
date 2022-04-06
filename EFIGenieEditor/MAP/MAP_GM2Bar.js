import Input_AnalogPolynomial from "../Input/Input_AnalogPolynomial.js";
export default class MAP_GM2Bar extends Input_AnalogPolynomial {
    static Name = `GM 2 Bar MAP`;
    static Measurement = `Pressure`;

    get saveValue() { return this.AnalogInput.saveValue; }
    set saveValue(saveValue) { return this.AnalogInput.saveValue = saveValue; }

    constructor(prop) {
        super(prop);
        this.Polynomial.hidden = true;
        this.Polynomial.minValue = 0.088;
        this.Polynomial.maxValue = 2.08;
        let value = [];
        value[0] = 0.082718614718615;
        value[1] = 0.398493506493506;
        this.Polynomial.value = value;
    }
}
MapConfigs.push(MAP_GM2Bar);
customElements.define(`map-gm2bar`, MAP_GM2Bar, { extends: `span` });