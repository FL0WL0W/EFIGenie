import UINumber from "../JavascriptUI/UINumber.js"
import UITemplate from "../JavascriptUI/UITemplate.js"
import Output_TDC from "../Output/Output_TDC.js"
import ConfigContainer from "./ConfigContainer.js"
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
export default class Ignition extends UITemplate {
    static template = getFileContents(`ConfigGui/Ignition.html`)

    IgnitionProperties = new IgnitionProperties()
    OutputCount = new UINumber({
        value: 8
    })
    Outputs = document.createElement(`div`)
    constructor(prop) {
        super()
        const thisClass = this
        Object.defineProperty(this.Outputs, 'saveValue', {
            get: function() { return [...this.children].map(x => x.saveValue) },
            set: function(saveValue) { 
                while(this.children.length > saveValue.length) this.removeChild(this.lastChild)
                for(let i = 0; i < saveValue.length; i++){
                    if(!this.children[i]) {
                        this.append(new Output_TDC({
                            label:          `Ignition ${i+1}`
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
                        let output = new Output_TDC({
                            label:          `Ignition ${i+1}`
                        })
                        output.addEventListener(`change`, () => {
                            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}))
                        })
                        this.append(output)
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
        this.IgnitionProperties.RegisterVariables()
        for(var i = 0; i < this.Outputs.children.length; i++){
            this.Outputs.children[i].RegisterVariables()
        }
    }
}
customElements.define(`top-ignition`, Ignition, { extends: `span` })