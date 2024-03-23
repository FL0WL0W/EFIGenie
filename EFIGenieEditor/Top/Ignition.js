import GenericCalculation from "../Calculation/GenericCalculation.js"
import OutputList from "../Output/OutputList.js"
import Output_TDC from "../Output/Output_TDC.js"
import ConfigContainer from "./ConfigContainer.js"
import ConfigList from "./ConfigList.js"
class IgnitionProperties extends ConfigContainer{
    static template = `<div data-element="IgnitionEnable"></div><div data-element="IgnitionAdvance"></div><div data-element="IgnitionDwell"></div><div data-element="IgnitionDwellDeviation"></div>`
    IgnitionEnable = new CalculationOrVariableSelection({
        calculations:   IgnitionEnableConfigs,
        label:          `Ignition Enable`,
        outputTypes:    [ `bool` ],
    })
    IgnitionAdvance = new CalculationOrVariableSelection({
        calculations:   IgnitionAdvanceConfigs,
        label:          `Ignition Advance`,
        outputUnits:    [ `°` ],
    })
    IgnitionDwell = new CalculationOrVariableSelection({
        calculations:   IgnitionDwellConfigs,
        label:          `Ignition Dwell`,
        outputUnits:    [ `s` ],
        displayUnits:   [ `ms` ]
    })
    IgnitionDwellDeviation = new CalculationOrVariableSelection({
        calculations:   IgnitionDwellConfigs,
        label:          `Ignition Dwell Deviation`,
        outputUnits:    [ `s` ],
        displayUnits:   [ `ms` ]
    })

    constructor(prop) {
        super()
        this.label = `Ignition Properties`
        this.Setup(prop)
    }
    RegisterVariables() {
        this.IgnitionEnable.RegisterVariables({ name: `IgnitionParameters.Ignition Enable` })
        this.IgnitionAdvance.RegisterVariables({ name: `IgnitionParameters.Ignition Advance` })
        this.IgnitionDwell.RegisterVariables({ name: `IgnitionParameters.Ignition Dwell` })
        this.IgnitionDwellDeviation.RegisterVariables({ name: `IgnitionParameters.Ignition Dwell Deviation` })
    }
}
customElements.define(`top-ignition-properties`, IgnitionProperties, { extends: `span` })
export default class Ignition extends ConfigList {
    constructor(prop) {
        prop = { ...prop,
            staticItems: [
                { name: `IgnitionProperties`, item: new IgnitionProperties()},
                { name: `IgnitionOutputs`, item: new OutputList({
                    label: `Injector Outputs`,
                    newOutput(i) {
                        return new Output_TDC({
                            label:          `Ignition ${i+1}`
                        })
                    }
                })},
            ],
            itemConstructor: GenericCalculation
        }
        super(prop)
    }

    RegisterVariables() {
        super.RegisterVariables({ name: `IgnitionParameters` })
    }

    get value() { return [ ...super.value, { name: `CrankPriority`, value: 1 } ] }
    set value(value) { super.value = value.filter(x => x.name !== CrankPriority) }
}
customElements.define(`top-ignition`, Ignition, { extends: `div` })