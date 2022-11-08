import UINumber from "../JavascriptUI/UINumber.js"
import Calculation_Formula from "../Calculation/Calculation_Formula.js"
import UITemplate from "../JavascriptUI/UITemplate.js"
import Output_TDC from "../Output/Output_TDC.js"
export default class Fuel extends UITemplate {
    static template =   getFileContents(`ConfigGui/Fuel.html`)

    OutputCount = new UINumber({
        value: 8
    })
    AFRConfigOrVariableSelection = new Calculation_Formula({
        calculations:   AFRConfigs,
        label:          `Air Fuel Ratio`,
        outputUnits:    [ `:1` ],
    })
    InjectorEnableConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   InjectorEnableConfigs,
        label:          `Injector Enable`,
        outputTypes:    [ `bool` ],
    })
    InjectorPulseWidthConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   InjectorPulseWidthConfigs,
        label:          `Injector Pulse Width`,
        outputUnits:    [ `s` ],
        displayUnits:   [ `ms` ]
    })
    InjectorEndPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   GenericConfigs,
        label:          `Injector End Position`,
        outputUnits:    [ `°` ],
    })
    Outputs = document.createElement(`div`)
    constructor(prop) {
        super()
        Object.defineProperty(this.Outputs, 'saveValue', {
            get: function() { return [...this.children].map(x => x.saveValue) },
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
            get: function() { return [...this.children].map(x => x.value) },
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
        this.OutputCount.addEventListener(`change`, () => {
            const count = this.OutputCount.value
            let newOutputs = this.Outputs.saveValue
            newOutputs.splice(count)
            for(let i = newOutputs.length; i < count; i++)
                newOutputs[i] = {}
                this.Outputs.saveValue = newOutputs
        })
        this.Setup(prop)
    }

    get saveValue() { return { ...super.saveValue, OutputCount: undefined } }
    set saveValue(saveValue) { 
        this.OutputCount.value = saveValue.Outputs.length
        super.saveValue = saveValue
    }
    
    get value() { return { ...super.value, OutputCount: undefined } }
    set value(value) { 
        this.OutputCount.value = value.Outputs.length
        super.value = value
    }


    RegisterVariables() {
        VariableRegister.RegisterVariable({ name: `FuelParameters.Cylinder Fuel Mass`, unit: `g` })

        this.AFRConfigOrVariableSelection.RegisterVariables({ name: `FuelParameters.Air Fuel Ratio` })
        this.InjectorEnableConfigOrVariableSelection.RegisterVariables({ name: `FuelParameters.Injector Enable` })
        this.InjectorPulseWidthConfigOrVariableSelection.RegisterVariables({ name: `FuelParameters.Injector Pulse Width` })
        this.InjectorEndPositionConfigOrVariableSelection.RegisterVariables({ name: `FuelParameters.Injector End Position` })

        for(var i = 0; i < this.Outputs.children.length; i++){
            this.Outputs.children[i].RegisterVariables()
        }
    }
}
customElements.define(`top-fuel`, Fuel, { extends: `span` })
