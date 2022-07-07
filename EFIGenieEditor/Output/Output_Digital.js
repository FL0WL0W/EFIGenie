import UITemplate from "../JavascriptUI/UITemplate.js"
import UIPinSelection from "../UI/UIPinSelection.js"
import UICheckBox from "../JavascriptUI/UICheckBox.js"
export default class Output_Digital extends UITemplate {
    static displayName = `Digital Pin`
    static inputTypes = [ `bool` ]
    static template =   `<label>Pin:</label><div data-element="pin"></div><div data-element="inverted"></div>Inverted <div data-element="highZ"></div>High Z`

    constructor(prop){
        super()
        this.pin = new UIPinSelection({
            value: 0xFFFF,
            pinType: `digital`
        })
        this.inverted = new UICheckBox()
        this.highZ = new UICheckBox()
        this.style.display = `block`
        this.Setup(prop)
    }
}
BooleanOutputConfigs.push(Output_Digital)
customElements.define(`output-digital`, Output_Digital, { extends: `span` })