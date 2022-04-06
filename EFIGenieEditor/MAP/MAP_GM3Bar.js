import Input_AnalogPolynomial from "../Input/Input_AnalogPolynomial.js";
export default class MAP_GM3Bar extends Input_AnalogPolynomial {
    static Name = `GM 3 Bar MAP`;
    static Measurement = `Pressure`;

    get saveValue() { return this.AnalogInput.saveValue; }
    set saveValue(saveValue) { return this.AnalogInput.saveValue = saveValue; }

    constructor(prop) {
        super(prop);
        this.Polynomial.hidden = true;
        this.Polynomial.minValue = 0.036;
        this.Polynomial.maxValue = 3.15;
        let value = [];
        value[0] = 0.016952380952381;
        value[1] = 0.628;
        this.Polynomial.value = value;
    }
}
MapConfigs.push(MAP_GM3Bar);
customElements.define(`map-gm3bar`, MAP_GM3Bar, { extends: `span` });