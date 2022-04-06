import UIDisplayNumberWithMeasurement from "./UIDisplayNumberWithMeasurement.js";
export default class UIDisplayLiveUpdate extends UIDisplayNumberWithMeasurement {
    GUID = generateGUID();
    get superHidden() {
        return super.hidden;
    }
    set superHidden(hidden) {
        super.hidden = hidden;
    }
    get hidden() {
        return this._stickyHidden;
    }
    set hidden(hidden) {
        if(hidden === false)
            debugger;
        this._stickyHidden = hidden
        if(hidden)
            super.hidden = hidden;
    }

    _variableReference = undefined;
    get VariableReference() {
        return this._variableReference;
    }
    set VariableReference(variableReference) {
        if(this._variableReference === variableReference)
            return;
        delete LiveUpdateEvents[this.GUID];

        this._variableReference = variableReference;

        if(variableReference) {
            let measurement = variableReference.substring(variableReference.lastIndexOf(`(`) + 1);
            measurement = measurement.substring(0, measurement.length - 1);
            this.Measurement = measurement;
        }
    }

    RegisterVariables() {
        const thisClass = this
        if(VariablesToPoll.indexOf(thisClass.VariableReference) === -1)
            VariablesToPoll.push(thisClass.VariableReference)
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.VariableReference) { 
                if(VariablesToPoll.indexOf(thisClass.VariableReference) === -1)
                    VariablesToPoll.push(thisClass.VariableReference)
                const variableId = VariableMetadata.GetVariableId(thisClass.VariableReference);
                if(CurrentVariableValues[variableId] !== undefined) {
                    thisClass.superHidden = false;
                    thisClass.value = CurrentVariableValues[variableId];
                    if(!thisClass.superHidden) {
                        if(thisClass.superHidden)
                            thisClass.superHidden = false;
                        if(thisClass.TimeoutHandle)
                            window.clearTimeout(thisClass.TimeoutHandle);
        
                        thisClass.TimeoutHandle = window.setTimeout(function() {
                            thisClass.superHidden = true;
                        },5000);
                    }
                } else {
                    thisClass.superHidden = true;
                }
            }
        };
    }

    constructor(prop) {
        prop ??= {};
        super(prop);
        this.superHidden = true;
        this.DisplayValue.class = `livevalue`;
    }
}
customElements.define(`ui-displayliveupdate`, UIDisplayLiveUpdate, { extends: `span` });