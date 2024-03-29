import CalculationOrVariableSelection from "../Calculation/CalculationOrVariableSelection.js"
import UINumber from "../JavascriptUI/UINumber.js"
import UITemplate from "../JavascriptUI/UITemplate.js"
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js"
import UIUnit from "../UI/UIUnit.js"
export default class CAN_PackData extends UITemplate {
    static displayName = `CAN Pack`
    static outputTypes = [ `CANData` ]
    static inputTypes = [ ]
    static template = `Offset:<div data-element="bitLocation"></div>Length:<div data-element="bitLength"></div><div data-element="multiplierLabel"></div><div data-element="multiplier"></div><div data-element="adderLabel"></div><div data-element="adder"></div><div data-element="variable"></div>`

    bitLocation = new UINumber({
        min: 0,
        max: 63,
        step: 1,
        value: 0,
        class: `canBitOffset`
    })
    bitLength = new UINumber({
        min: 1,
        max: 64,
        step: 1,
        value: 1,
        class: `canBitLength`
    })
    multiplierLabel = document.createElement(`span`)
    multiplier = new UINumber({
        value: 1,
        class: `canMultiplier`
    })
    adderLabel = document.createElement(`span`)
    adder = new UINumber({
        value: 0,
        class: `canAdder`
    })
    variable = new CalculationOrVariableSelection({
        outputTypes: [ `bool` ],
        calculations: GenericConfigs,
        template: `<div data-element="selection"></div><div data-element="liveUpdate"></div><span data-element="calculationContent"></span>`
    })

    constructor(prop) {
        super()
        this.variable.style.display = `inline`
        this.multiplierLabel.innerText = `Multiplier:`
        this.adderLabel.innerText = `Adder:`
        this.multiplier.hidden = this.multiplierLabel.hidden = this.adder.hidden = this.adderLabel.hidden = true
        this.bitLocation.addEventListener(`change`, () => {
            this.bitLength.max = 64-this.bitLocation.value
        })
        this.bitLength.addEventListener(`change`, () => {
            this.multiplier.hidden = this.multiplierLabel.hidden = this.adder.hidden = this.adderLabel.hidden = this.bitLength.value < 2
            this.variable.outputTypes = [ this.bitLength.value < 2? `bool` : `float` ]
        })
        this.Setup(prop)
    }

    RegisterVariables(reference) {
    }
}
customElements.define(`can-pack-data`, CAN_PackData, { extends: `span` })