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
        measurement:    `Voltage`,
        valueUnit:      `V`
    })
    voltage100 = new UINumberWithUnit({
        value:          4.9,
        step:           0.001,
        min:            0.001,
        measurement:    `Voltage`,
        valueUnit:      `V`
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
        this.polynomial.hidden = true
        this.updatePolynomial()
        this.polynomial.addEventListener(`change`, () => {
            this.updatePolynomial()
        })
        this.voltage0.addEventListener(`change`, () => {
            this.updatePolynomial()
        })
        this.voltage100.addEventListener(`change`, () => {
            this.updatePolynomial()
        })
        this.calibrate.addEventListener(`click`, () => {
            if(this.calibrate.label == `Stop`) {
                this.calibrate.label = `Calibrate`
            } else {
                this.polarity = this.voltage100.value < this.voltage0.value ? -1 : 1
                this.voltage0.value = this.voltage100.value = this.voltageLiveUpdate.value
                this.calibrate.label = `Stop`
            }
        })
        this.swap.addEventListener(`click`, () => {
            this.polarity = -this.polarity
            const temp = this.voltage0.value
            this.voltage0.value = this.voltage100.value
            this.voltage100.value = temp
        })
        this.Setup(prop)
        this.outputUnits = this.constructor.outputUnits
    }

    RegisterVariables(reference) {
        super.RegisterVariables(reference)
        const origUpdateEvent = communication.liveUpdateEvents[this.voltageLiveUpdate.GUID]
        communication.liveUpdateEvents[this.voltageLiveUpdate.GUID] = (variableMetadata, currentVariableValues) => {
            origUpdateEvent(variableMetadata, currentVariableValues)
            const liveValue = this.voltageLiveUpdate.value
            const calibrating = this.calibrate.label == `Stop`
            this.calibrate.hidden = liveValue == undefined
            if(liveValue != undefined) {
                this.calibrate.hidden = false
                if(this.polarity > 0) {
                    if(calibrating && liveValue < this.voltage0.value)
                        this.voltage0.value = liveValue
                    if(calibrating && liveValue > this.voltage100.value)
                        this.voltage100.value = liveValue
                } else {
                    if(calibrating && liveValue < this.voltage100.value)
                        this.voltage100.value = liveValue
                    if(calibrating && liveValue > this.voltage0.value)
                        this.voltage0.value = liveValue
                }
            } else {
                this.calibrate.hidden = true
            }
        }
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