import Input_AnalogPolynomial from "../Input/Input_AnalogPolynomial.js";
export default class MAP_GM3Bar extends Input_AnalogPolynomial {
    static displayName = `GM 3 Bar MAP`;
    static measurementName = `Pressure`;

    get saveValue() { return this.analogInput.saveValue; }
    set saveValue(saveValue) { return this.analogInput.saveValue = saveValue; }

    constructor(prop) {
        super(prop);
        this.polynomial.hidden = true;
        this.polynomial.minValue = 0.036;
        this.polynomial.maxValue = 3.15;
        let coeffecients = [];
        coeffecients[0] = 0.016952380952381;
        coeffecients[1] = 0.628;
        this.polynomial.coeffecients = coeffecients;
    }
}
MapConfigs.push(MAP_GM3Bar);
customElements.define(`map-gm3bar`, MAP_GM3Bar, { extends: `span` });