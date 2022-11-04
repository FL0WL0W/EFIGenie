import UISelection from "../JavascriptUI/UISelection.js"
import UITemplate from "../JavascriptUI/UITemplate.js"
import UIUnit from "./UIUnit.js"
export default class UIParameterWithUnit extends UITemplate {
    static template = `<div data-element="parameterSelection"></div><div data-element="unitSelection"></div>`

    parameterSelection = new UISelection()
    unitSelection = new UIUnit()
    constructor(prop){
        super()
        this.parameterSelection.addEventListener(`change`, e => {
            const units = this.units
            this.unitSelection.measurement = GetMeasurementNameFromUnitName(units)
            if(units !== undefined)
                this.unitSelection.hidden = this.unitHidden
            else 
                this.unitSelection.hidden = true
        })
        this.Setup(prop)
    }

    #unitHidden = false
    get unitHidden() { return this.#unitHidden }
    set unitHidden(unitHidden) { 
        this.#unitHidden = unitHidden
        if(this.units !== undefined)
            this.unitSelection.hidden = unitHidden
        else 
            this.unitSelection.hidden = true
    }

    get selectHidden() { return this.parameterSelection.selectHidden }
    set selectHidden(selectHidden) { this.parameterSelection.selectHidden = selectHidden }
    get selectDisabled() { return this.parameterSelection.selectDisabled }
    set selectDisabled(selectDisabled) { this.parameterSelection.selectDisabled = selectDisabled }
    get selectValue() { return this.parameterSelection.selectValue }
    set selectValue(selectValue) { this.parameterSelection.selectValue = selectValue }

    get selectedOption() {
        return (typeof this.parameterSelection.selectedOption === `object` && this.optionUnits[this.parameterSelection.selectedOption.name] !== undefined)? 
            { ...this.parameterSelection.selectedOption, unit: this.unitSelection.selectedOption } : this.parameterSelection.selectedOption
    }
    set selectedOption(selectedOption) {
        if(typeof selectedOption === `object`) {
            if(this.optionUnits[selectedOption.name] !== undefined)
                this.unitSelection.selectedOption = selectedOption.unit
            delete selectedOption.unit
            this.parameterSelection.selectedOption = selectedOption
        } else {
            this.parameterSelection.selectedOption = selectedOption
        }
    }

    get value() {
        return (typeof this.parameterSelection.value === `object` && this.optionUnits[this.parameterSelection.value.name] !== undefined)? 
            { ...this.parameterSelection.value, unit: this.unit } : this.parameterSelection.value
    }
    set value(value) {
        if(typeof value === `object`) {
            value = {...value}
            if(this.optionUnits[value.name] !== undefined)
                this.unitSelection.value = value.unit
            delete value.unit
            this.parameterSelection.value = value
        } else {
            this.parameterSelection.value = value
        }
    }

    get saveValue() {
        return (typeof this.parameterSelection.saveValue === `object` && this.optionUnits[this.parameterSelection.saveValue.name] !== undefined)? 
            { ...this.parameterSelection.saveValue, unit: this.unit } : this.parameterSelection.saveValue
    }
    set saveValue(saveValue) {
        if(typeof saveValue === `object`) {
            saveValue = {...saveValue}
            if(this.optionUnits[saveValue.name] !== undefined)
                this.unitSelection.saveValue = saveValue.unit
            delete saveValue.unit
            this.parameterSelection.saveValue = saveValue
        } else {
            this.parameterSelection.saveValue = saveValue
        }
    }

    get units() { return this.parameterSelection.value?.name != undefined? this.optionUnits[this.parameterSelection.value.name] : undefined }
    get unit() { return this.units.find(x => GetMeasurementNameFromUnitName(x) === GetMeasurementNameFromUnitName(this.unitSelection.value)) }
    get displayUnit() { return this.unitSelection.value }
    set displayUnit(displayUnit) { this.unitSelection.value = displayUnit }

    optionUnits = {}
    get options() { 
        const thisClass = this
        function expand(options) {
            let expandedOptions = []
            for(const optionIndex in options) {
                let option = {...options[optionIndex]}
                if(option.group) {
                    option.options = expand(option.options)
                    expandedOptions.push(option)
                } else if(typeof option.value === `object` && thisClass.optionUnits[option.value.name] !== undefined) {
                    for(const unitIndex in thisClass.optionUnits[option.value.name]) {
                        option = {...options[optionIndex]}
                        option.value = {...option.value}
                        const unit = thisClass.optionUnits[option.value.name][unitIndex]
                        option.value.unit = unit
                        option.info = `[${GetMeasurementNameFromUnitName(unit)}]`
                        expandedOptions.push(option)
                    }
                } else {
                    expandedOptions.push(option)
                }
            }
            return expandedOptions
        }
        return expand(this.parameterSelection.options)
    }
    set options(options) {
        const thisClass = this
        function flatten(options) {
            for(const optionIndex in options) {
                let option = options[optionIndex]
                if(option.group) {
                    option.options = flatten(option.options)
                } else if(typeof option.value === `object` && option.value.unit !== undefined) {
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