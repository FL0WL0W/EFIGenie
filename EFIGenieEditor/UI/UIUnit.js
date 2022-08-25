import UISelection from "../JavascriptUI/UISelection.js"
export default class UIUnit extends UISelection {
    _hidden = false
    get hidden() { return this._hidden }
    set hidden(hidden) {
        this._hidden = hidden
        if(hidden || this.options.length === 0) super.hidden = true
        else super.hidden = false
    }

    get value() { return super.value }
    set value(value) {
        let measurement = GetMeasurementNameFromUnitName(value)
        if(measurement == undefined) return
        this.measurement = measurement
        super.value = value
    }

    _measurement
    get measurement() { return this._measurement }
    set measurement(measurement){
        if(!measurement || this._measurement === measurement) return
        this._measurement = measurement
        this.default = Measurements[measurement]?.[0]?.name
        this.options = Measurements[measurement]?.map(unit => { return { name: unit.name, value: unit.name } })
        if(this.value == undefined || this.value === `` || this.value === null) this.value = this.default
        if(this.options.length === 0) super.hidden = true
        else if(!this.hidden) super.hidden = false
    }

    get saveValue() {
        if(this.value === this.default) return
        return super.saveValue
    }
    set saveValue(saveValue) {
        if(saveValue == undefined || saveValue === ``) return
        super.saveValue = saveValue
    }

    constructor(prop) {
        super(prop)
        if(prop?.measurement || prop?.value) this.default = this.value
        this.class = `ui unit`
        this.selectHidden = true
        this.selectName = ``
    }
}
customElements.define(`ui-unit`, UIUnit, { extends: `div` })