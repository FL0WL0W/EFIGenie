import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
export default class CylinderAirmass_SpeedDensity extends UITemplate {
    static displayName = `Speed Density`
    static outputUnits = [`g`]
    static Requirements = [`Cylinder Air Temperature`, `Manifold Absolute Pressure`, `Volumetric Efficiency`]
    static template = `<label>Cylinder Volume:</label><div data-element="CylinderVolume"></div>`

    constructor(prop) {
        super()
        this.CylinderVolume = new UINumberWithUnit({
            value:          0.66594,
            step:           0.001,
            min:            0.001,
            measurement:    `Volume`,
            valueUnit:      `L`,
            displayUnit:    `mL`
        })
        this.style.display = `block`
        this.Setup(prop)
    }
}
CylinderAirmassConfigs.push(CylinderAirmass_SpeedDensity)
customElements.define(`cylinderairmass-speeddensity`, CylinderAirmass_SpeedDensity, { extends: `span` })