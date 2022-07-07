import Reluctor_Template from "./Reluctor_Template.js"
import UINumber from "../JavascriptUI/UINumber.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
export default class Reluctor_UniversalMissingTeeth extends Reluctor_Template {
    static displayName = `Reluctor Universal Missing Teeth`
    static template =   Reluctor_Template.template +
                        `<br/><label>First Tooth Position:</label><div data-element="firstToothPosition"></div>(Falling Edge)` +
                        `<br/><label>Tooth Width:</label><div data-element="toothWidth"></div>` +
                        `<br/><label>Number of Teeth:</label><div data-element="numberOfTeeth"></div>` +
                        `<br/><label>Number of Teeth Missing:</label><div data-element="numberOfTeethMissing"></div>`

    firstToothPosition = new UINumberWithUnit({
        value: 0,
        step: 0.1,
        min: 0,
        max: 360,
        valueUnit: `°`
    })
    toothWidth = new UINumberWithUnit({
        value: 5,
        step: 0.1,
        min: 0,
        max: 360,
        valueUnit: `°`
    })
    numberOfTeeth = new UINumber({
        value: 36,
        min: 2
    })
    constructor(prop){
        super()
        this.length.value = 72
        const thisClass = this
        this.numberOfTeeth.addEventListener(`change`, function() {
            thisClass.length.value = thisClass.NumberOfTeeth.value * 2
        })
        this.numberOfTeethMissing = new UINumber({
            value: 1,
            min: 1
        })
        this.Setup(prop)
    }
}
ReluctorConfigs.push(Reluctor_UniversalMissingTeeth)
customElements.define(`reluctor-universalmissingteeth`, Reluctor_UniversalMissingTeeth, { extends: `span` })