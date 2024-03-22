import CalculationOrVariableSelection from "../Calculation/CalculationOrVariableSelection.js"
import UINumber from "../JavascriptUI/UINumber.js"
export default class Output_TDC extends CalculationOrVariableSelection {
    static inputTypes = [ `bool` ]

    TDC = new UINumber({
        value:  0,
        step:   1,
        min:    0,
        max:    720
    })
    constructor(prop) {
        super()
        this.inputTypes = [ `bool` ]
        this.required = true
        this.calculations = BooleanOutputConfigs
        let span = document.createElement(`span`)
        span.append(`\xa0\xa0\xa0\xa0\xa0\xa0TDC:`)
        span.append(this.TDC)
        span.append(`°`)
        this.Setup(prop)
        this.labelElement.parentElement.append(span)
        this.labelElement.class = `pinselectname`
        this.selection.addEventListener(`change`, () => {
            if(this.options.map(option => option.options?.length ?? 1).reduce((partionSum, a) => partionSum + a, 0) < 2 && this.SubConfig.querySelectorAll("label").length < 2) {
                this.selection.hidden = true
                if(this.subConfigLabel === undefined) {
                    this.subConfigLabel = this.SubConfig.firstChild
                    this.SubConfig.firstChild.remove()
                    this.SubConfig.style.display = ``
                }
            } else if(this.subConfigLabel !== undefined) {
                this.SubConfig.insertBefore(this.subConfigLabel, this.SubConfig.firstChild)
                this.SubConfig.style.display = `block`
            }
        })
    }
}
customElements.define(`output-tdc`, Output_TDC, { extends: `span` })