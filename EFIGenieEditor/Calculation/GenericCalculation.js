import UIText from "../JavascriptUI/UIText.js"
import CalculationOrVariableSelection from "./CalculationOrVariableSelection.js"
export default class GenericCalculation extends CalculationOrVariableSelection {
    name = new UIText({ class: `genericCalculationName` })

    get nameEditable() { return !this.name.disabled }
    set nameEditable(nameEditable) { this.name.disabled = !nameEditable }

    constructor(prop) {
        prop = {
            calculations:   GenericConfigs,
            selectionFilter: defaultNoVariables,
            ...prop
        }
        const nameValue = prop.name ?? `Name`
        delete prop.name
        super()
        super.Setup(prop)
        this.labelElement.replaceWith(this.name)
        this.name.addEventListener(`change`, () =>{
            this.label = this.name.value
            this.name.parentElement.setAttribute('label', this.label);
        })
        this.name.value = nameValue
    }

    RegisterVariables(reference) {
        reference = { ...reference, name: reference?.name === undefined? this.name.value : `${reference.name}.${this.name.value}` }
        super.RegisterVariables(reference)
    }

    get saveValue() {
        const saveValue = super.saveValue
        return { ...saveValue, name: this.nameEditable? saveValue.name : undefined}
    }
    set saveValue(saveValue) {
        super.saveValue = { ...saveValue, name: this.nameEditable? saveValue.name : undefined}
    }
}
customElements.define(`top-generic-calculation`, GenericCalculation, { extends: `span` })