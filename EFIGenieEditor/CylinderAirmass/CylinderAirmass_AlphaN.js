import UITemplate from "../JavascriptUI/UITemplate.js"
export default class CylinderAirmass_AlphaN extends UITemplate {
    static displayName = `Alpha N`
    static outputUnits = [`g`]
    static Requirements = [`Throttle Position`]
    static template = `<div data-element="Airmass"></div>`

    Airmass = new CalculationOrVariableSelection({
        calculations:   AirmassConfigs,
        label:          `Airnass`,
        outputUnits:    [ `g` ],
        displayUnits:   [ `g` ]
    })
    constructor(prop) {
        super()
        this.style.display = `block`
        this.Setup(prop)
    }
}
CylinderAirmassConfigs.push(CylinderAirmass_AlphaN)
customElements.define(`cylinderairmass-alphan`, CylinderAirmass_AlphaN, { extends: `span` })