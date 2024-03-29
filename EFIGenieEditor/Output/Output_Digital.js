import UITemplate from "../JavascriptUI/UITemplate.js"
import UIPinSelection from "../UI/UIPinSelection.js"
import UICheckBox from "../JavascriptUI/UICheckBox.js"
export default class Output_Digital extends UITemplate {
    static displayName = `Digital Pin`
    static inputTypes = [ `bool` ]
    static template =   `<label>Pin:</label><div data-element="pin"></div><div data-element="inverted"></div>Inverted <div data-element="highZ"></div>High Z`

    pin = new UIPinSelection({ value: 0xFFFF, pinType: `digital` })
    
    constructor(prop){
        super()
        this.inverted = new UICheckBox()
        this.highZ = new UICheckBox()
        this.style.display = `block`
        this.Setup(prop)
    }

    RegisterVariables() {
        this.pin.updateOptions()
    }
}
BooleanOutputConfigs.push(Output_Digital)
customElements.define(`output-digital`, Output_Digital, { extends: `span` })