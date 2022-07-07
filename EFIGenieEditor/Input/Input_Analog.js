import UITemplate from "../JavascriptUI/UITemplate.js"
import UIPinSelection from "../UI/UIPinSelection.js"
export default class Input_Analog extends UITemplate {
    static displayName = `Analog Pin`
    static outputUnits = [ `V` ]
    static template = `<label>Pin:</label><div data-element="pin"></div>`

    pin = new UIPinSelection({ value: 0xFFFF, pinType: `analog` })
    constructor(prop){
        super()
        this.style.display = `block`
        this.Setup(prop)
    }
}
customElements.define(`input-analog`, Input_Analog, { extends: `span` })
RawInputConfigs.push(Input_Analog)