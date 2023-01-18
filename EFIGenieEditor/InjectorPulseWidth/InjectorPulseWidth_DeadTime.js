import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
export default class InjectorPulseWidth_DeadTime extends UITemplate {
    static displayName = `Dead Time`
    static outputUnits = [ `s` ]
    static template =   `<div data-element="FlowRate"></div>` +
                        `<div data-element="DeadTime"></div>` +
                        `<label>Min Injector Fuel Mass:</label><div data-element="MinInjectorFuelMass"></div>`

    FlowRate = new CalculationOrVariableSelection({
        calculations:   GenericConfigs,
        label:          `Injector Flow Rate`,
        outputUnits:    [ `g/s` ],
    })
    DeadTime = new CalculationOrVariableSelection({
        calculations:   GenericConfigs,
        label:          `Injector Dead Time`,
        outputUnits:    [ `s` ],
        displayUnits:   [ `ms` ]
    })
    MinInjectorFuelMass = new UINumberWithUnit({
        value:          0.005,
        step:           0.001,
        measurement:    `Mass`,
        valueUnit:      `g`,
        displayUnit:    `mg`
    })
    constructor(prop) {
        super()
        this.style.display = `block`
        this.Setup(prop)
    }

    RegisterVariables() {
        this.DeadTime.RegisterVariables({ name: `FuelParameters.Injector Dead Time` })
        this.FlowRate.RegisterVariables({ name: `FuelParameters.Injector Flow Rate` })
    }
}
InjectorPulseWidthConfigs.push(InjectorPulseWidth_DeadTime)
customElements.define(`injectorpulsewidth-deadtime`, InjectorPulseWidth_DeadTime, { extends: `span` })
