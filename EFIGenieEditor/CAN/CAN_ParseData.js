import UINumber from "../JavascriptUI/UINumber.js"
import UITemplate from "../JavascriptUI/UITemplate.js"
import UIText from "../JavascriptUI/UIText.js"
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js"
import UIUnit from "../UI/UIUnit.js"
export default class CAN_ParseData extends UITemplate {
    static displayName = `CAN Parse`
    static outputTypes = [ `bool|float` ]
    static inputTypes = [ `CANData` ]
    static template = `<div data-element="name"></div>: Offset:<div data-element="bitLocation"></div>Length:<div data-element="bitLength"></div><div data-element="multiplierLabel"></div><div data-element="multiplier"></div><div data-element="adderLabel"></div><div data-element="adder"></div><div data-element="unit"></div><div data-element="liveUpdate"></div>`

    name = new UIText({ class: `canParseDataName` })
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
    unit = new UIUnit()
    liveUpdate = new UIDisplayLiveUpdate()

    constructor(prop) {
        super()
        this.multiplierLabel.innerText = `Multiplier:`
        this.adderLabel.innerText = `Adder:`
        this.multiplier.hidden = this.multiplierLabel.hidden = this.adder.hidden = this.adderLabel.hidden = this.unit.hidden = true
        this.liveUpdate.style.float = `right`
        this.bitLocation.addEventListener(`change`, () => {
            this.bitLength.max = 64-this.bitLocation.value
        })
        this.bitLength.addEventListener(`change`, () => {
            this.multiplier.hidden = this.multiplierLabel.hidden = this.adder.hidden = this.adderLabel.hidden = this.unit.hidden = this.bitLength.value < 2
        })
        this.unit.addEventListener(`change`, () => {
            this.liveUpdate.valueUnit = this.bitLength.value < 2? undefined : this.unit.value
        })
        this.Setup(prop)
    }

    RegisterVariables(reference) {
        reference = { ...reference, name: `${reference.name}.${this.name.value}` }

        reference.unit = this.unit.value ?? reference.unit
        if(reference.unit && this.bitLength.value > 1) {
            delete reference.type
        } else {
            delete reference.unit
            reference.type = this.bitLength.value < 2? `bool` : `float`
        }

        VariableRegister.RegisterVariable(reference)
        console.log(reference)
        this.liveUpdate.RegisterVariables(reference)
    }
}
customElements.define(`can-parse-data`, CAN_ParseData, { extends: `span` })