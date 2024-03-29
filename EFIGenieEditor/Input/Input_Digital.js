import UITemplate from "../JavascriptUI/UITemplate.js"
import UICheckBox from "../JavascriptUI/UICheckBox.js"
import UIPinSelection from "../UI/UIPinSelection.js"
export default class Input_Digital extends UITemplate {
    static displayName = `Digital Pin`
    static outputTypes = [ `bool` ]
    static template = `<label>Pin:</label><div data-element="pin"></div><div data-element="inverted"></div>Inverted`

    inverted = new UICheckBox()
    pin = new UIPinSelection({ value: 0xFFFF, pinType: `digital` })
    constructor(prop){
        super()
        this.style.display = `block`
        this.Setup(prop)
    }

    RegisterVariables() {
        this.pin.updateOptions()
    }
}
RawInputConfigs.push(Input_Digital)
customElements.define(`input-digital`, Input_Digital, { extends: `span` })