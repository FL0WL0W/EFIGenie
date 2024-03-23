import ConfigContainer from "../Top/ConfigContainer.js"
import Output_TDC from "../Output/Output_TDC.js"
import GenericCalculation from "../Calculation/GenericCalculation.js"
import ConfigList from "./ConfigList.js"
import OutputList from "../Output/OutputList.js"
class InjectorProperties extends ConfigContainer{
    static template = `<div data-element="InjectorEnable"></div><div data-element="InjectorPulseWidth"></div><div data-element="InjectorEndPosition"></div>`
    InjectorEnable = new CalculationOrVariableSelection({
        calculations:   InjectorEnableConfigs,
        label:          `Injector Enable`,
        outputTypes:    [ `bool` ],
    })
    InjectorPulseWidth = new CalculationOrVariableSelection({
        calculations:   InjectorPulseWidthConfigs,
        label:          `Injector Pulse Width`,
        outputUnits:    [ `s` ],
        displayUnits:   [ `ms` ]
    })
    InjectorEndPosition = new CalculationOrVariableSelection({
        calculations:   GenericConfigs,
        label:          `Injector End Position`,
        outputUnits:    [ `°` ],
    })

    constructor(prop) {
        super()
        this.label = `Injector Properties`
        this.Setup(prop)
    }
    RegisterVariables() {
        this.InjectorEnable.RegisterVariables({ name: `FuelParameters.Injector Enable` })
        this.InjectorPulseWidth.RegisterVariables({ name: `FuelParameters.Injector Pulse Width` })
        this.InjectorEndPosition.RegisterVariables({ name: `FuelParameters.Injector End Position` })
    }
}
customElements.define(`top-injector-properties`, InjectorProperties, { extends: `span` })
export default class Fuel extends ConfigList {
    constructor(prop) {
        prop = { ...prop,
            staticItems: [
                { name: `AFR`, item: new GenericCalculation({
                    calculations:   AFRConfigs,
                    name:          `Air Fuel Ratio`,
                    nameEditable:   false,
                    outputUnits:    [ `:1` ],
                })},
                { name: `InjectorProperties`, item: new InjectorProperties()},
                { name: `InjectorOutputs`, item: new OutputList({
                    label: `Injector Outputs`,
                    newOutput(i) {
                        return new Output_TDC({
                            label:          `Injector ${i+1}`
                        })
                    }
                })},
            ],
            itemConstructor: GenericCalculation
        }
        super(prop)
    }

    RegisterVariables() {
        VariableRegister.RegisterVariable({ name: `FuelParameters.Cylinder Fuel Mass`, unit: `g` })
        super.RegisterVariables({ name: `FuelParameters` })
    }
}
customElements.define(`top-fuel`, Fuel, { extends: `div` })
