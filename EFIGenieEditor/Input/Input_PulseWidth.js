import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
import UIPinSelection from "../UI/UIPinSelection.js"
export default class Input_PulseWidth extends UITemplate {
    static displayName = `Pulse Width Pin`
    static outputUnits = [ `s` ]
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
RawInputConfigs.push(Input_PulseWidth)
customElements.define(`input-pulsewidth`, Input_PulseWidth, { extends: `span` })