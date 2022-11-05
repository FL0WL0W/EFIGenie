import UINumberWithUnit from "../UI/UINumberWithUnit.js"
import UINumber from "../JavascriptUI/UINumber.js"
import UISelection from "../JavascriptUI/UISelection.js"
export default class Calculation_Polynomial extends HTMLSpanElement {
    static displayName = `Polynomial`
    static outputTypes = [ `float` ]
    static inputTypes = [ `float` ]

    #coeffecientElement = document.createElement(`div`)
    #minValueElement = new UINumberWithUnit({  value: 0 })
    #maxValueElement = new UINumberWithUnit({ value: 1 })
    #degreeElement = new UINumber({
        min: 2,
        max: 100,
        step: 1,
        value: 0
    })
    constructor(prop) {
        super()
        this.append(document.createElement(`br`))
        const minValueLabel = document.createElement(`label`)
        minValueLabel.textContent = `Minimum Value:`
        this.append(minValueLabel)
        this.#minValueElement.displayUnitElement.hidden = true
        this.append(this.#minValueElement)
        this.append(document.createElement(`br`))
        const maxValueLabel = document.createElement(`label`)
        this.append(maxValueLabel)
        this.#maxValueElement.displayUnitElement.hidden = true
        maxValueLabel.textContent = `Maximum Value:`
        this.append(this.#maxValueElement)
        this.append(document.createElement(`br`))
        const degreeLabel = document.createElement(`label`)
        degreeLabel.textContent = `Degree:`
        this.append(degreeLabel)
        this.append(this.#degreeElement)
        this.append(document.createElement(`br`))
        this.#degreeElement.addEventListener(`change`, () => {
            while(this.#coeffecientElement.children.length > this.degree) { this.#coeffecientElement.removeChild(this.#coeffecientElement.lastChild) }
            for(let i = this.#coeffecientElement.children.length; i < this.degree; i++) {
                let coeffecientElement = this.#coeffecientElement.appendChild(document.createElement(`div`))
                let number = coeffecientElement.appendChild(i === 0? new UINumberWithUnit({ value: 0 }) : new UINumber({ value: 0 }))
                if(i !== 0) {
                    let label = coeffecientElement.appendChild(document.createElement(`span`))
                    label.innerHTML = `x<sup>${i}</sup> +`
                } else {
                    number.addEventListener(`change`, () => { coeffecientElement.dispatchEvent(new Event(`change`, {bubbles: true})) })
                }
                coeffecientElement.style.display = `inline`
                Object.defineProperty(coeffecientElement, 'value', {
                    get: function() { return this.firstChild.value },
                    set: function(value) { this.firstChild.value = value }
                })
            }
        })
        this.degree = 2
        this.append(this.#coeffecientElement)
        this.#coeffecientElement.style.display = `flex`
        this.#coeffecientElement.style.flexDirection = `row-reverse`
        this.#coeffecientElement.style.alignItems = `flex-start`
        this.#coeffecientElement.style.justifyContent = `flex-end`
        this.#coeffecientElement.firstChild.addEventListener(`change`, () => {
            this.displayUnits = this.displayUnits
        })
        this.Setup(prop)
    }
    Setup(prop) {
        Object.assign(this, prop)
    }
    get coeffecients() { return [...this.#coeffecientElement.children].map((element, index) => { return element.value })  }
    set coeffecients(value) {
        this.degree = value.length
        for(let i = 0; i < this.#coeffecientElement.children.length; i++) {
            this.#coeffecientElement.children[i].value = value[i]
        }
    }
    get minValue() { return this.#minValueElement.value }
    set minValue(minValue) { this.#minValueElement.value = minValue }
    get maxValue() { return this.#maxValueElement.value }
    set maxValue(maxValue) { this.#maxValueElement.value = maxValue }
    get degree() { return this.#degreeElement.value }
    set degree(degree) { this.#degreeElement.value = degree  }
    
    get displayUnit() { return this.#coeffecientElement.firstChild.firstChild.displayUnit }
    set displayUnit(displayUnit) { 
        this.#coeffecientElement.firstChild.firstChild.displayUnit = this.#coeffecientElement.firstChild.firstChild.valueUnit = displayUnit
        this.#minValueElement.displayUnit = this.#maxValueElement.valueUnit = displayUnit
        this.#maxValueElement.displayUnit = this.#maxValueElement.valueUnit = displayUnit
        this.#coeffecientElement.firstChild.firstChild.displayUnit = displayUnit
    }
    get measurement() { return this.#coeffecientElement.firstChild.firstChild.measurement }
    set measurement(measurement) { this.#coeffecientElement.firstChild.firstChild.measurement = measurement }
    get valueUnit() { return this.#coeffecientElement.firstChild.firstChild.valueUnit }
    set valueUnit(valueUnit) { 
        this.#coeffecientElement.firstChild.firstChild.displayUnit = this.#coeffecientElement.firstChild.firstChild.valueUnit = valueUnit
        this.#minValueElement.displayUnit = this.#maxValueElement.valueUnit = valueUnit
        this.#maxValueElement.displayUnit = this.#maxValueElement.valueUnit = valueUnit
        this.#coeffecientElement.firstChild.firstChild.displayUnit = valueUnit
    }
    get value() {
        return { 
            minValue: this.minValue,
            maxValue: this.maxValue,
            coeffecients: this.coeffecients,
            unit: this.valueUnit
        }
    }
    set value(value) {
        if(value) {
            this.minValue = value.minValue
            this.maxValue = value.maxValue
            this.coeffecients = value.coeffecients
            if(!this._outputUnits)
                this.numberElement.displayUnit = value.unit
        }
    }
    get saveValue() {
        return { 
            minValue: this.#minValueElement.saveValue,
            maxValue: this.#maxValueElement.saveValue,
            coeffecients: this.coeffecients,
            unit: this.displayUnit
        }
    }
    set saveValue(saveValue) {
        if(saveValue) {
            this.#minValueElement.saveValue = saveValue.minValue
            this.#maxValueElement.saveValue = saveValue.maxValue
            this.coeffecients = saveValue.coeffecients
            this.displayUnit = saveValue.unit
        }
    }

    _outputUnits
    get outputUnits() { return this._outputUnits ?? [ this.valueUnit ] }
    set outputUnits(outputUnits) { 
        this._outputUnits = outputUnits
        this.valueUnit = outputUnits?.[0]
        if(this.valueUnit != undefined)
            this.measurement = GetMeasurementNameFromUnitName(this.valueUnit)
    }
    get displayUnits() { return [ this.displayUnit ] }
    set displayUnits(displayUnits) { this.displayUnit = displayUnits?.[0] }
}
customElements.define('ui-polynomial', Calculation_Polynomial, { extends: `span` })
GenericConfigs.push(Calculation_Polynomial)