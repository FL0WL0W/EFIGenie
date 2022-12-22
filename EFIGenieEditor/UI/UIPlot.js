import UITemplate from "../JavascriptUI/UITemplate.js"
import UIParameterWithUnit from "./UIParameterWithUnit.js"
export default class UIPlot extends UITemplate {
    constructor(prop) {
        super()
        
        this.Setup(prop)
    }

    GUID = generateGUID()
    RegisterVariables() {
        let options = VariableRegister.GetSelections(undefined, defaultFilter(undefined, [ `float` ]))
        let metadataOptions = communication.variableMetadata?.GetSelections(undefined, defaultFilter(undefined, [ `float` ]))
        for(const i in metadataOptions) {
            const option = metadataOptions[i]
            if(option.group) {
                const optionGroup = options.find(x => x.group === option.group)
                if(optionGroup == undefined) {
                    options.push(option)
                } else {
                    for(const i in option.options) {
                        const optionG = option.options[i]
                        if(optionGroup.options.find(x => objectTester(x.value, optionG.value)) == undefined) {
                            optionGroup.options.push(optionG)
                        }
                    }
                }
            } else {
                if(options.find(x => objectTester(x.value, option.value)) == undefined) {
                    options.push(option)
                }
            }
        }
        this.variable.options = options

        const reference = this.variable.value
        const variable = this.communication?.variableMetadata?.GetVariableByReference(reference) ?? VariableRegister.GetVariableByReference(reference)
        if(!reference?.unit && reference?.type?.split(`|`)?.indexOf(`float`) === -1) return
        this.valueUnit = variable?.unit
        if(communication.variablesToPoll.indexOf(reference) === -1)
            communication.variablesToPoll.push(reference)
        communication.liveUpdateEvents[this.GUID] = (variableMetadata, currentVariableValues) => {
            if(reference) { 
                const variableId = variableMetadata?.GetVariableId(reference)
                if(currentVariableValues?.[variableId] != undefined) {
                    this.value = currentVariableValues[variableId]
                }
            }
        }
    }
}
customElements.define(`ui-gauge`, UIGauge, { extends: `span` })