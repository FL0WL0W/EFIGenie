import Input_AnalogPolynomial from "../Input/Input_AnalogPolynomial.js"
import UIButton from "../JavascriptUI/UIButton.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
export default class TPS_Linear extends Input_AnalogPolynomial {
    static displayName = `Linear TPS`
    static outputUnits = [ `[0.0-1.0]` ]
    static template =   `${Input_AnalogPolynomial.template}<div style="display: flex;"><div style="display: inline-block;"><div><label>0% Voltage:</label><div data-element="voltage0"></div></div><div><label>100% Voltage:</label><div data-element="voltage100"></div></div></div><div style="display: flex; align-items: center;"><div data-element="swap"></div><div data-element="calibrate"></div></div></div>`
    voltage0 = new UINumberWithUnit({
        value:          0.1,
        step:           0.001,
        min:            0.001,
        valueUnit:      `V`,
        displayUnit:    `V`
    })
    voltage100 = new UINumberWithUnit({
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
    swap = new UIButton({
        label:          `⤸`
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
        this.voltage0.addEventListener(`change`, function() {
            thisClass.updatePolynomial()
        })
        this.voltage100.addEventListener(`change`, function() {
            thisClass.updatePolynomial()
        })
        this.calibrate.addEventListener(`click`, function() {
            if(thisClass.calibrate.label == `Stop`) {
                thisClass.calibrate.label = `Calibrate`
            } else {
                thisClass.polarity = thisClass.voltage100.value < thisClass.voltage0.value ? -1 : 1
                thisClass.voltage0.value = thisClass.voltage100.value = thisClass.voltageLiveUpdate.value
                thisClass.calibrate.label = `Stop`
            }
        })
        this.swap.addEventListener(`click`, function() {
            thisClass.polarity = -thisClass.polarity
            const temp = thisClass.voltage0.value
            thisClass.voltage0.value = thisClass.voltage100.value
            thisClass.voltage100.value = temp
        })
        this.voltageLiveUpdate.addEventListener(`change`, function() {
            const liveValue = thisClass.voltageLiveUpdate.value
            const calibrating = thisClass.calibrate.label == `Stop`
            thisClass.calibrate.hidden = liveValue == undefined
            if(liveValue != undefined) {
                thisClass.calibrate.hidden = false
                if(thisClass.polarity > 0) {
                    if(calibrating && liveValue < thisClass.voltage0.value)
                        thisClass.voltage0.value = liveValue
                    if(calibrating && liveValue > thisClass.voltage100.value)
                        thisClass.voltage100.value = liveValue
                } else {
                    if(calibrating && liveValue < thisClass.voltage100.value)
                        thisClass.voltage100.value = liveValue
                    if(calibrating && liveValue > thisClass.voltage0.value)
                        thisClass.voltage0.value = liveValue
                }
            } else {
                thisClass.calibrate.hidden = true
            }
        })
        this.Setup(prop)
    }

    updatePolynomial() {
        const v0 = this.voltage0.value
        const v100 = this.voltage100.value
        let coeffecients = []
        coeffecients[1] = 1/(v100-v0)
        coeffecients[0] = -v0*coeffecients[1]
        this.polynomial.minValue = 0
        this.polynomial.maxValue = 1
        this.polynomial.coeffecients = coeffecients
    }
}
TpsConfigs.push(TPS_Linear)
customElements.define(`tps-linear`, TPS_Linear, { extends: `span` })