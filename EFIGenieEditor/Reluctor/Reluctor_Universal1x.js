import Reluctor_Template from "./Reluctor_Template.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
export default class Reluctor_Universal1x extends Reluctor_Template {
    static displayName = `Reluctor Universal 1X`
    static template =   Reluctor_Template.template +
                        `<br/><label>Rising Edge Position:</label><div data-element="risingPosition"></div>` +
                        `<br/><label>Falling Edge Position:</label><div data-element="fallingPosition"></div>`

    constructor(prop){
        super()
        prop.risingPosition = new UINumberWithUnit({
            value: 0,
            step: 0.1,
            min: 0,
            max: 360,
            valueUnit: `°`
        })
        prop.fallingPosition = new UINumberWithUnit({
            value: 180,
            step: 0.1,
            min: 0,
            max: 360,
            valueUnit: `°`
        })
        this.Setup(prop)
        this.length.value = 8
    }
}
ReluctorConfigs.push(Reluctor_Universal1x)
customElements.define(`reluctor-universal1x`, Reluctor_Universal1x, { extends: `span` })