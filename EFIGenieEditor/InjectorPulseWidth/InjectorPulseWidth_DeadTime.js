import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumberWithUnit from "../UI/UINumberWithUnit.js"
export default class InjectorPulseWidth_DeadTime extends UITemplate {
    static displayName = `Dead Time`
    static outputUnits = [ `s` ]
    static template =   `<div data-element="FlowRateConfigOrVariableSelection"></div>` +
                        `<div data-element="DeadTimeConfigOrVariableSelection"></div>` +
                        `<label>Min Injector Fuel Mass:</label><div data-element="MinInjectorFuelMass"></div>`

    FlowRateConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   GenericConfigs,
        label:          `Injector Flow Rate`,
        outputUnits:    [ `g/s` ],
    })
    DeadTimeConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   GenericConfigs,
        label:          `Injector Dead Time`,
        outputUnits:    [ `s` ],
        displayUnits:   [ `ms` ]
    })
    MinInjectorFuelMass = new UINumberWithUnit({
        value:          0.005,
        step:           0.001,
        valueUnit:      `g`,
        displayUnits:   [ `mg` ]
    })
    constructor(prop) {
        super()
        this.style.display = `block`
        this.Setup(prop)
    }

    RegisterVariables() {
        this.DeadTimeConfigOrVariableSelection.RegisterVariables({ name: `FuelParameters.Injector Dead Time` })
        this.FlowRateConfigOrVariableSelection.RegisterVariables({ name: `FuelParameters.Injector Flow Rate` })
    }
}
InjectorPulseWidthConfigs.push(InjectorPulseWidth_DeadTime)
customElements.define(`injectorpulsewidth-deadtime`, InjectorPulseWidth_DeadTime, { extends: `span` })
