import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
import UIPinSelection from "../UI/UIPinSelection.js"
export default class Input_Frequency extends UITemplate {
    static displayName = `Frequency Pin`
    static outputUnits = [ `Hz` ]
    static template =   `<label>Pin:</label><div data-element="pin"></div>` +
                        `<br/><label>Minimum Frequency:</label><div data-element="minFrequency"></div>`

    constructor(prop){
        super()
        this.pin = new UIPinSelection({
            value: 0xFFFF,
            pinType: `pwm`
        })
        this.minFrequency = new UINumberWithUnit({
            value: 1000,
            step: 1,
            min: 0,
            max: 65535,
            valueUnit: `Hz`
        })
        this.style.display = `block`
        this.Setup(prop)
    }
}
RawInputConfigs.push(Input_Frequency)
customElements.define(`input-frequency`, Input_Frequency, { extends: `span` })