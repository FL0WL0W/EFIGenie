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
        const thisClass = this
        let variable = VariableRegister.GetVariableByReference(reference)
        variable ??= reference
        if(!variable?.unit && variable?.type?.split(`|`)?.indexOf(`float`) === -1) return
        this.valueUnit = variable.unit
        if(VariablesToPoll.indexOf(reference) === -1)
            VariablesToPoll.push(reference)
        LiveUpdateEvents[this.GUID] = function() {
            if(reference) { 
                const variableId = VariableMetadata.GetVariableId(reference)
                if(CurrentVariableValues[variableId] != undefined) {
                    thisClass.superHidden = false
                    thisClass.value = CurrentVariableValues[variableId]
                    if(!thisClass.superHidden) {
                        if(thisClass.superHidden)
                            thisClass.superHidden = false
                        if(thisClass.TimeoutHandle)
                            window.clearTimeout(thisClass.TimeoutHandle)
        
                        thisClass.TimeoutHandle = window.setTimeout(function() {
                            thisClass.superHidden = true
                        },5000)
                    }
                } else {
                    thisClass.superHidden = true
                }
            }
        }
    }

    constructor(prop) {
        prop ??= {}
        super(prop)
        this.superHidden = true
        this.displayElement.class = `livevalue`
    }
}
customElements.define(`ui-displayliveupdate`, UIDisplayLiveUpdate, { extends: `span` })