import UINumberWithUnit from "./UINumberWithUnit.js"
export default class UIDisplayNumberWithUnit extends UINumberWithUnit {
    static template = `<div data-element="displayElement"></div><div data-element="displayUnitElement"></div>`

    ZeroesToAdd = 10000000
    displayElement = document.createElement(`div`)

    constructor(prop) {
        super()
        this.Setup(prop)
        const thisClass = this
        this.displayUnitElement.addEventListener(`change`, function() {
            thisClass.ZeroesToAdd = 10000000
            thisClass.UpdateDisplayValue()
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        this.displayElement.style.display = this.displayUnitElement.style.display = `inline-block`
        this.ZeroesToAdd = 10000000
    }

    get saveValue() { return this.displayUnitElement.saveValue }
    set saveValue(saveValue) { this.displayUnitElement.saveValue = saveValue }

    set value(value) {
        const displayUnit = this.displayUnit
        const valueUnit = this.valueUnit
        function valueToDisplayValue(value) { return value == undefined || !displayUnit? value : ConvertValueFromUnitToUnit(value, valueUnit, displayUnit) }
        let displayValue = valueToDisplayValue(value)
        if(displayValue == undefined) return
            
        displayValue = `${parseFloat(parseFloat(parseFloat(displayValue).toFixed(5)).toPrecision(6))}`
        const indexOfPoint = displayValue.indexOf(`.`)
        var zeroesToAdd = Math.max(0, 6-(displayValue.length - indexOfPoint))
        if(indexOfPoint === -1) zeroesToAdd = 6
        if(zeroesToAdd < this.ZeroesToAdd) this.ZeroesToAdd = zeroesToAdd
        zeroesToAdd -= this.ZeroesToAdd
        if(zeroesToAdd > 0 && indexOfPoint < 0) displayValue += `.`
        for(var i = 0; i < zeroesToAdd; i++) displayValue += `0`

        this.displayElement.textContent = displayValue
    }
}
customElements.define(`ui-displaynumberwithunit`, UIDisplayNumberWithUnit, { extends: `span` })