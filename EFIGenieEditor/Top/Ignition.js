import UITemplate from "../JavascriptUI/UITemplate.js"
import Output_TDC from "../Output/Output_TDC.js"
export default class Ignition extends UITemplate {
    static template = getFileContents(`ConfigGui/Ignition.html`)

    constructor(prop) {
        super()
        this.IgnitionEnableConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:   IgnitionEnableConfigs,
            label:          `Ignition Enable`,
            outputTypes:    [ `bool` ],
        })
        this.IgnitionAdvanceConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:   IgnitionAdvanceConfigs,
            label:          `Ignition Advance`,
            outputUnits:    [ `°` ],
        })
        this.IgnitionDwellConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:   IgnitionDwellConfigs,
            label:          `Ignition Dwell`,
            outputUnits:    [ `s` ],
            displayUnit:    `ms`
        })
        this.IgnitionDwellDeviationConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:   IgnitionDwellConfigs,
            label:          `Ignition Dwell Deviation`,
            outputUnits:    [ `°` ],
            displayUnit:    `ms`
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
                            label:              `Ignition ${i+1}`
                        }))
                    }
                    this.children[i].value = value[i]
                }
            }
        })
        this.Outputs.value = new Array(8)
        this.Setup(prop)
    }

    RegisterVariables() {
        this.IgnitionEnableConfigOrVariableSelection.RegisterVariables({ name: `IgnitionParameters.Ignition Enable` })
        this.IgnitionAdvanceConfigOrVariableSelection.RegisterVariables({ name: `IgnitionParameters.Ignition Advance` })
        this.IgnitionDwellConfigOrVariableSelection.RegisterVariables({ name: `IgnitionParameters.Ignition Dwell` })
        this.IgnitionDwellDeviationConfigOrVariableSelection.RegisterVariables({ name: `IgnitionParameters.Ignition Dwell Deviation` })

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].RegisterVariables()
        }
    }
}
customElements.define(`top-ignition`, Ignition, { extends: `span` })