import Calculation_Formula from "../Calculation/Calculation_Formula.js"
import UITemplate from "../JavascriptUI/UITemplate.js"
import Output_TDC from "../Output/Output_TDC.js"
export default class Fuel extends UITemplate {
    static template =   getFileContents(`ConfigGui/Fuel.html`)

    constructor(prop) {
        super()
        this.AFRConfigOrVariableSelection = new Calculation_Formula({
            calculations:   AFRConfigs,
            label:          `Air Fuel Ratio`,
            outputUnits:    [ `:1` ],
        })
        this.InjectorEnableConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:   InjectorEnableConfigs,
            label:          `Injector Enable`,
            outputTypes:    [ `bool` ],
        })
        this.InjectorPulseWidthConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:   InjectorPulseWidthConfigs,
            label:          `Injector Pulse Width`,
            outputUnits:    [ `s` ],
            displayUnit:    `ms`
        })
        this.InjectorEndPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:   GenericConfigs,
            label:          `Injector End Position`,
            outputUnits:    [ `°` ],
        })
        this.Outputs = document.createElement(`div`)
        Object.defineProperty(this.Outputs, 'saveValue', {
            get: function() { return [...this.children].map(e => e.saveValue) },
            set: function(saveValue) { 
                while(this.children.length > saveValue.length) this.removeChild(this.lastChild)
                for(let i = 0; i < saveValue.length; i++){
                    if(!this.children[i]) {
                        this.append(new Output_TDC({
                            label:          `Injector ${i+1}`
                        }))
                    }
                    this.children[i].saveValue = saveValue[i]
                }
            }
        })
        Object.defineProperty(this.Outputs, 'value', {
            get: function() { return [...this.children].map(e => e.value) },
            set: function(value) { 
                while(this.children.length > value.length) this.removeChild(this.lastChild)
                for(let i = 0; i < value.length; i++){
                    if(!this.children[i]) {
                        this.append(new Output_TDC({
                            label:          `Injector ${i+1}`
                        }))
                    }
                    this.children[i].value = value[i]
                }
            }
        })
        this.Outputs.value = new Array(8)
        this.Setup(prop)
    }

    get saveValue() {
        return super.saveValue
    }
    set saveValue(saveValue) {
        if(saveValue?.ConfigInjectorOutputs)
            saveValue.Outputs = saveValue.ConfigInjectorOutputs.Outputs

        super.saveValue = saveValue
    }

    RegisterVariables() {
        VariableRegister.RegisterVariable({ name: `FuelParameters.Cylinder Fuel Mass`, unit: `g` })

        this.AFRConfigOrVariableSelection.RegisterVariables({ name: `FuelParameters.Air Fuel Ratio` })
        this.InjectorEnableConfigOrVariableSelection.RegisterVariables({ name: `FuelParameters.Injector Enable` })
        this.InjectorPulseWidthConfigOrVariableSelection.RegisterVariables({ name: `FuelParameters.Injector Pulse Width` })
        this.InjectorEndPositionConfigOrVariableSelection.RegisterVariables({ name: `FuelParameters.Injector End Position` })

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].RegisterVariables()
        }
    }
}
customElements.define(`top-fuel`, Fuel, { extends: `span` })
