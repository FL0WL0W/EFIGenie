import UISelection from "../JavascriptUI/UISelection.js"
import UITemplate from "../JavascriptUI/UITemplate.js"
import UIUnit from "./UIUnit.js"
export default class UIParameterWithUnit extends UITemplate {
    static template = `<div data-element="parameterSelection"></div><div data-element="unitSelection"></div>`

    parameterSelection = new UISelection({ selectHidden: true })
    unitSelection = new UIUnit()
    constructor(prop){
        super()
        this.parameterSelection.addEventListener(`change`, e => {
            this.unitSelection.measurement = GetMeasurementNameFromUnitName(this.units)
        })
        this.Setup(prop)
    }

    get value() {
        return { ...this.parameterSelection.value, unit: this.unitSelection.value }
    }
    set value(value) {
        this.unitSelection.value = value.unit
        delete value.unit
        this.parameterSelection.value = value
    }

    get saveValue() {
        return { ...this.parameterSelection.saveValue, unit: this.unitSelection.saveValue }
    }
    set saveValue(saveValue) {
        this.unitSelection.saveValue = saveValue.unit
        delete saveValue.unit
        this.parameterSelection.saveValue = saveValue
    }

    get units() { return this.parameterSelection.value?.name != undefined? this.optionUnits[this.parameterSelection.value.name] : undefined }
    get unit() { return this.units.find(x => GetMeasurementNameFromUnitName(x) === GetMeasurementNameFromUnitName(this.unitSelection.value)) }
    get displayUnit() { return this.unitSelection.value }
    set displayUnit(displayUnit) { this.unitSelection.value = displayUnit }

    optionUnits = {}
    get options() {}
    set options(options) {
        const thisClass = this
        function flatten(options) {
            for(const optionIndex in options) {
                let option = options[optionIndex]
                if(option.group) {
                    option.options = flatten(option.options)
                } else {
                    thisClass.optionUnits[option.value.name] ??= []
                    thisClass.optionUnits[option.value.name].push(option.value.unit)
                    if(options.filter(x=>x?.value?.name === option.value.name).length > 1) {
                        delete options[optionIndex]
                    } else {
                        delete option.value.unit
                        delete option.info
                    }
                }
            }
            return options.filter(x => true)
        }
        this.optionUnits = {}
        this.parameterSelection.options = flatten(options)
        this.unitSelection.measurement = GetMeasurementNameFromUnitName(this.units)
    }
    
}
customElements.define(`ui-parameterwithunit`, UIParameterWithUnit, { extends: `span` })