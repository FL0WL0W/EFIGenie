import UITemplate from "../JavascriptUI/UITemplate.js"
import UICheckBox from "../JavascriptUI/UICheckBox.js"
import UINumber from "../JavascriptUI/UINumber.js"
import UIPinSelection from "../UI/UIPinSelection.js"
export default class Input_DigitalRecord extends UITemplate {
    static displayName = `Digital Pin (Record)`
    static outputTypes = [ `Record` ]
    static template =   `<label>Pin:</label><div data-element="pin"></div><div data-element="inverted"></div>Inverted` +
                        `<br/><label>Length:</label><div data-element="length"></div>`

    constructor(prop){
        super()
        this.pin = new UIPinSelection({
            value: 0xFFFF,
            pinType: `digitalinterrupt`
        })
        this.inverted = new UICheckBox()
        this.length = new UINumber ({
            value: 2,
            step: 1,
            min: 1,
            max: 1000
        })
        this.style.display = `block`
        this.Setup(prop)
    }
}
RawInputConfigs.push(Input_DigitalRecord)
customElements.define(`input-digitalrecord`, Input_DigitalRecord, { extends: `span` })