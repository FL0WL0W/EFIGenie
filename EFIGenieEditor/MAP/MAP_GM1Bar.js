import Input_AnalogPolynomial from "../Input/Input_AnalogPolynomial.js"
export default class MAP_GM1Bar extends Input_AnalogPolynomial {
    static displayName = `GM 1 Bar MAP`
    static outputUnits = [ `Bar` ]

    get saveValue() { return this.analogInput.saveValue }
    set saveValue(saveValue) { return this.analogInput.saveValue = saveValue }

    constructor(prop) {
        super(prop)
        this.outputUnits = this.constructor.outputUnits
        this.polynomial.hidden = true
        this.polynomial.minValue = 0.1
        this.polynomial.maxValue = 1.05
        let coeffecients = []
        coeffecients[0] = 0.101515151515152
        coeffecients[1] = 0.18987012987013
        this.polynomial.coeffecients = coeffecients
    }
}
MapConfigs.push(MAP_GM1Bar)
customElements.define(`map-gm1bar`, MAP_GM1Bar, { extends: `span` })