import Input_AnalogPolynomial from "../Input/Input_AnalogPolynomial.js"
import UIButton from "../JavascriptUI/UIButton.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
export default class TPS_Linear extends Input_AnalogPolynomial {
    static displayName = `Linear TPS`
    static outputUnits = [ `[0.0-1.0]` ]
    static template =   `${Input_AnalogPolynomial.template}<div><label>0% Voltage:</label><div data-element="minVoltage"></div><div data-element="calibrate"></div></div><div><label>100% Voltage:</label><div data-element="maxVoltage"></div></div>`
    minVoltage = new UINumberWithUnit({
        value:          0.1,
        step:           0.001,
        min:            0.001,
        valueUnit:      `V`,
        displayUnit:    `V`
    })
    maxVoltage = new UINumberWithUnit({
        value:          4.9,
        step:           0.001,
        min:            0.001,
        valueUnit:      `V`,
        displayUnit:    `V`
    })
    calibrate = new UIButton({
        label:          `Calibrate`,
        hidden:         true
    })
    get saveValue() { 
        let saveValue = super.saveValue
        delete saveValue.polynomial
        return saveValue
    }
    set saveValue(saveValue) { super.saveValue = saveValue }

    constructor(prop) {
        super()
        const thisClass = this
        this.polynomial.hidden = true
        this.updatePolynomial()
        this.minVoltage.addEventListener(`change`, function() {
            thisClass.updatePolynomial()
        })
        this.maxVoltage.addEventListener(`change`, function() {
            thisClass.updatePolynomial()
        })
        this.calibrate.addEventListener(`click`, function() {
            if(thisClass.calibrate.label == `Stop`) {

            } else {
                thisClass.calibrate.label = `Stop`
            }
        })
        this.voltageLiveUpdate.addEventListener(`change`, function() {
            const liveValue = thisClass.voltageLiveUpdate.value
            const calibrating = thisClass.calibrate.label == `Stop`
            thisClass.calibrate.hidden = liveValue == undefined
            if(liveValue != undefined) {
                thisClass.calibrate.hidden = false
                if(calibrating && liveValue < thisClass.minVoltage.value)
                    thisClass.minVoltage.value = liveValue
                if(calibrating && liveValue > thisClass.maxVoltage.value)
                    thisClass.maxVoltage.value = liveValue
            } else {
                thisClass.calibrate.hidden = true
            }
        })
        this.Setup(prop)
    }

    updatePolynomial() {
        const min = this.minVoltage.value
        const max = this.maxVoltage.value
        let coeffecients = []
        coeffecients[1] = 1/(max-min)
        coeffecients[0] = -min*coeffecients[1]
        this.polynomial.minValue = 0
        this.polynomial.maxValue = 1
        this.polynomial.coeffecients = coeffecients
    }
}
TpsConfigs.push(TPS_Linear)
customElements.define(`tps-linear`, TPS_Linear, { extends: `span` })