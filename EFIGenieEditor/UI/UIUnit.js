import UISelection from "../JavascriptUI/UISelection.js"
export default class UIUnit extends UISelection {
    static allMeasurementOptions = Object.keys(Measurements).map(measurement => { 
        if(Measurements[measurement].length === 0 || (Measurements[measurement].length === 1 && Measurements[measurement][0].name === ``))
            return { name: measurement, value: `` }
        if(Measurements[measurement].length === 1)
            return { name: `${measurement} [${Measurements[measurement][0].name}]`, value: Measurements[measurement][0].name }

        return { group: measurement, options: Measurements[measurement]?.map(unit => { return { selectedName: `${measurement} [${unit.name}]`, name: `${unit.name}`, value: unit.name } }) } 
    })

    _hidden = false
    get hidden() { return this._hidden }
    set hidden(hidden) {
        this._hidden = hidden
        if(hidden || this.options.length === 0) super.hidden = true
        else super.hidden = false
    }

    get value() { return super.value }
    set value(value) {
        super.value = value
    }

    _measurement
    get measurement() { return Array.isArray(this._measurement)? this._measurement.find(x => x === GetMeasurementNameFromUnitName(this.value)) : this._measurement }
    set measurement(measurement){
        if(this._measurement === measurement) return
        if(!measurement) {
            this.options = UIUnit.allMeasurementOptions
            this.default = ``
        } else {
            this.value = undefined
            this._measurement = measurement
            this.default = GetDefaultUnitFromMeasurement(measurement)
            if(Array.isArray(measurement))
                this.options = UIUnit.allMeasurementOptions.filter(x => measurement.indexOf(x.group) !== -1 || measurement.some(y=>x.name?.indexOf(y) === 0))
                    .map(x=> x.group? { group: x.group, options: x.options.map(y=> { return { ...y, selectedName: undefined} } ) } : { ...x, selectedName: x.value === ``? x.selectedName : x.value } )
            else
                this.options = Measurements[measurement]?.map(unit => { return { name: unit.name, value: unit.name } })
        }
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
        prop ??= {}
        prop.options ??= UIUnit.allMeasurementOptions
        super(prop)
        if(prop?.measurement || prop?.value) this.default = this.value
        this.class = `ui unit`
        this.selectHidden = true
    }
}
customElements.define(`ui-unit`, UIUnit, { extends: `div` })