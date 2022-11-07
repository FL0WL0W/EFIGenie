import UIDisplayNumberWithUnit from "./UIDisplayNumberWithUnit.js"
export default class UIDisplayLiveUpdate extends UIDisplayNumberWithUnit {
    GUID = generateGUID()
    get superHidden() { return super.hidden }
    set superHidden(hidden) { super.hidden = hidden }
    get hidden() { return this._stickyHidden }
    set hidden(hidden) {
        this._stickyHidden = hidden
        if(hidden) super.hidden = hidden
    }

    RegisterVariables(reference) {
        let variable = VariableRegister.GetVariableByReference(reference)
        variable ??= reference
        if(!variable?.unit && variable?.type?.split(`|`)?.indexOf(`float`) === -1) return
        this.measurement = GetMeasurementNameFromUnitName(variable.unit)
        this.valueUnit = variable.unit
        if(communication.variablesToPoll.indexOf(reference) === -1)
            communication.variablesToPoll.push(reference)
        communication.liveUpdateEvents[this.GUID] = (variableMetadata, currentVariableValues) => {
            if(reference) { 
                const variableId = variableMetadata?.GetVariableId(reference)
                if(currentVariableValues?.[variableId] != undefined) {
                    this.superHidden = false
                    this.value = currentVariableValues[variableId]
                    if(!this.superHidden) {
                        if(this.superHidden)
                        this.superHidden = false
                        if(this.TimeoutHandle)
                            window.clearTimeout(this.TimeoutHandle)
        
                        this.TimeoutHandle = window.setTimeout(() => {
                            this.value = undefined
                            this.superHidden = true
                        },5000)
                    }
                } else {
                    this.superHidden = true
                }
            }
        }
    }

    constructor(prop) {
        super(prop ?? {})
        this.superHidden = true
        this.displayElement.class = `livevalue`
    }
}
customElements.define(`ui-displayliveupdate`, UIDisplayLiveUpdate, { extends: `span` })