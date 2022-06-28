import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js"
export default class CylinderAirmass_SpeedDensity extends UITemplate {
    static displayName = `Speed Density`
    static measurementNameName = `Mass`
    static output = `float`
    static Requirements = [`Cylinder Air Temperature`, `Manifold Absolute Pressure`, `Volumetric Efficiency`]
    static template = `<label>Cylinder Volume:</label><div data-element="CylinderVolume"></div>`

    get value() {
        let value = super.value;
        value.type = `CylinderAirmass_SpeedDensity`;
        return value;
    }
    set value(value) {
        super.value = value;
    }

    constructor(prop) {
        super();
        this.CylinderVolume = new UINumberWithMeasurement({
            value:              0.66594,
            step:               0.001,
            min:                0.001,
            measurementName:        `Volume`,
            measurementUnitName:`mL`
        })
        this.style.display = `block`
        this.Setup(prop)
    }

    GetObjOperation(result) {
        let obj = this.value
        obj.result = result

        return obj
    }
}
CylinderAirmassConfigs.push(CylinderAirmass_SpeedDensity)
customElements.define(`cylinderairmass-speeddensity`, CylinderAirmass_SpeedDensity, { extends: `span` })