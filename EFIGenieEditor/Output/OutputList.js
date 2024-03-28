import UINumber from "../JavascriptUI/UINumber.js"
import ConfigContainer from "../Top/ConfigContainer.js"

export default class OutputList extends ConfigContainer {
    static template = `<div data-element="Outputs"></div>`

    OutputCount = new UINumber({
        value: 8
    })

    labelAndCountElement = document.createElement(`div`)
    Outputs = document.createElement(`div`)
    constructor(prop) {
        super()
        this.OutputCount.addEventListener(`change`, () => {
            const count = this.OutputCount.value
            let newOutputs = this.saveValue
            newOutputs.splice(count)
            for(let i = newOutputs.length; i < count; i++)
                newOutputs[i] = {}
                this.saveValue = newOutputs
        })
        this.Setup(prop)
        if(prop.value === undefined) this.value = new Array(8)
    }

    get saveValue () { return [...this.Outputs.children].map(x => x.saveValue) }
    set saveValue (saveValue) { 
        this.OutputCount.value = saveValue.length
        while(this.Outputs.children.length > saveValue.length) this.Outputs.removeChild(this.Outputs.lastChild)
        for(let i = 0; i < saveValue.length; i++){
            if(!this.Outputs.children[i]) {
                const output = this.newOutput(i)
                output.addEventListener(`change`, () => {
                    this.dispatchEvent(new Event(`change`, {bubbles: true}))
                })
                this.Outputs.append(output)
            }
            this.Outputs.children[i].saveValue = saveValue[i]
        }
    }
    
    get value() { return [...this.Outputs.children].map(x => x.value) }
    set value(value) { 
        this.OutputCount.value = value.length
        while(this.Outputs.children.length > value.length) this.Outputs.removeChild(this.Outputs.lastChild)
        for(let i = 0; i < value.length; i++){
            if(!this.Outputs.children[i]) {
                const output = this.newOutput(i)
                output.addEventListener(`change`, () => {
                    this.dispatchEvent(new Event(`change`, {bubbles: true}))
                })
                this.Outputs.append(output)
            }
            this.Outputs.children[i].value = value[i]
        }
    }

    Setup(prop) {
        super.Setup(prop)
        this.labelElement.replaceWith(this.labelAndCountElement)
        this.labelAndCountElement.append(this.labelElement)
        this.labelAndCountElement.append(this.OutputCount)
    }

    RegisterVariables() {
        for(var i = 0; i < this.Outputs.children.length; i++){
            this.Outputs.children[i].RegisterVariables()
        }
    }
}
customElements.define(`top-injector-outputs`, OutputList, { extends: `span` })