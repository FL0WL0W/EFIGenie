import UITable from "../JavascriptUI/UITable.js"
import UITemplate from "../JavascriptUI/UITemplate.js";
import UIUnit from "./UIUnit.js"
export default class UITableWithUnit extends UITemplate {
    static template = `<div data-element="displayValueElement">`
    
    get measurement() { return this.displayUnitElement.measurement }
    set measurement(measurement) { this.displayUnitElement.measurement = measurement }
    get displayUnit() { return this.displayUnitElement.value }
    set displayUnit(displayUnit) { this.displayUnitElement.value = displayUnit ?? this._valueUnit }
    get displayValue() { return this.displayValueElement.value }
    set displayValue(displayValue) { this.displayValueElement.value = displayValue }

    _valueUnit
    get valueUnit() { return this._valueUnit ?? this.displayUnit }
    set valueUnit(valueUnit) { 
        if(this._valueUnit === valueUnit) return
        let newValue = this.value == undefined? undefined : this.value.map(x => ConvertValueFromUnitToUnit(x, this._valueUnit, valueUnit))
        this._valueUnit = valueUnit
        this.displayUnit ??= valueUnit
        this.value = newValue
    }
    #value
    get value() { return this.#value }
    set value(value) {
        if(objectTester(this.#value, value)) return
        this.#value = value
        this.UpdateDisplayValue()
    }

    get xResolutionModifiable() { return this.displayValueElement.xResolutionModifiable }
    set xResolutionModifiable(xResolutionModifiable) { this.displayValueElement.xResolutionModifiable = xResolutionModifiable }
    get xResolution() { return this.displayValueElement.xResolution }
    set xResolution(xResolution) { this.displayValueElement.xResolution = xResolution }
    get xAxis() { return this.displayValueElement.xAxis }
    set xAxis(xAxis) { this.displayValueElement.xAxis = xAxis }
    get xLabel() { return this.displayValueElement.xLabel }
    set xLabel(xLabel) { this.displayValueElement.xLabel = xLabel }
    get yResolutionModifiable() { return this.displayValueElement.yResolutionModifiable }
    set yResolutionModifiable(yResolutionModifiable) { this.displayValueElement.yResolutionModifiable = yResolutionModifiable }
    get yResolution() { return this.displayValueElement.yResolution }
    set yResolution(yResolution) { this.displayValueElement.yResolution = yResolution }
    get yAxis() { return this.displayValueElement.yAxis }
    set yAxis(yAxis) { this.displayValueElement.yAxis = yAxis }
    get yLabel() { return this.displayValueElement.yLabel }
    set yLabel(yLabel) { this.displayValueElement.yLabel = yLabel }
    get zLabel() { return this.#zLabel; }
    set zLabel(zLabel) {
        if(this.#zLabel === zLabel)
            return;
        this.#zLabel = zLabel;
        this.#zLabelElement.replaceChildren(zLabel ?? ``);
    }
    get selecting() { return this.displayValueElement.selecting }
    set selecting(selecting) { this.displayValueElement.selecting = selecting }

    #min
    get min() { return this.#min }
    set min(min) {
        if(this.#min === min) return
        this.#min = min
        this.UpdateDisplayValue()
    }

    #max
    get max() { return this.#max }
    set max(max) {
        if(this.#max === max) return
        this.#max = max
        this.UpdateDisplayValue()
    }

    #step
    get step() { return this.#step }
    set step(step) {
        if(this.#step === step) return
        this.#step = step
        this.UpdateDisplayValue()
    }
    
    #zLabelElementWithUnit = document.createElement(`div`);
    #zLabelElement = document.createElement(`span`);
    #zLabel = undefined
    constructor(prop) {
        super()
        const thisClass = this
        this.displayValueElement = new UITable()
        this.displayUnitElement = new UIUnit({
            measurement : prop?.measurement,
            value: prop?.displayUnit ?? prop?.valueUnit
        })
        let oldUnit = this.displayUnit
        this.displayUnitElement.addEventListener(`change`, function() {
            if(thisClass.displayValue != undefined)
                thisClass.displayValue = thisClass.displayValue.map(x => ConvertValueFromUnitToUnit(x, oldUnit, thisClass.displayUnit))
            oldUnit = thisClass.displayUnit
        })
        this.displayValueElement.addEventListener(`change`, function() {
            if(thisClass.displayValue != undefined && thisClass.displayUnit)
                thisClass.#value = thisClass.displayValue.map(x => ConvertValueFromUnitToUnit(x, thisClass.displayUnit, thisClass.valueUnit))
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        this.#zLabelElementWithUnit.append(this.#zLabelElement)
        this.#zLabelElementWithUnit.append(this.displayUnitElement)
        this.displayValueElement.zLabel = this. #zLabelElementWithUnit
        if(prop) {
            const propValue = prop.value;
            delete prop.value;
            Object.assign(this, prop);
            this.value = propValue;
        }
        this.Setup(prop)
    }

    get saveValue() {
        return {
            ...this.displayValueElement.saveValue,
            value: this.value,
            ...(this.displayUnitElement.saveValue != undefined) && { unit: this.displayUnitElement.saveValue }
        }
    }
    set saveValue(saveValue){
        this.displayValueElement.saveValue = saveValue
        this.value = saveValue.value
        if(saveValue.unit != undefined)
            this.displayUnitElement.saveValue = saveValue.unit
    }

    UpdateDisplayValue() {
        const displayUnit = this.displayUnit
        const valueUnit = this.valueUnit
        function valueToDisplayValue(value) { return value == undefined || !displayUnit? value : ConvertValueFromUnitToUnit(value, valueUnit, displayUnit) }
        this.displayValue               = this.value.map(x => valueToDisplayValue(x))
        this.displayValueElement.min    = valueToDisplayValue(this.min)     ?? this.displayValueElement.min
        this.displayValueElement.max    = valueToDisplayValue(this.max)     ?? this.displayValueElement.max
        this.displayValueElement.step   = valueToDisplayValue(this.step)    ?? this.displayValueElement.step
    }
    attachToTable(table) {
        this.displayValueElement.attachToTable(table)
        table.attachToTable(this.displayValueElement)
    }
    trail(x, y, z) {
        this.displayValueElement.trail(x,y,z)
    }
}
customElements.define(`ui-tablewithunit`, UITableWithUnit, { extends: `span` })