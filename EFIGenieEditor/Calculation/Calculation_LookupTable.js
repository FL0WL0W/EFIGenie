import UITemplate from "../JavascriptUI/UITemplate.js";
import UISelection from "../JavascriptUI/UISelection.js";
import UIDialog from "../JavascriptUI/UIDialog.js";
import UITable from "../JavascriptUI/UITable.js";
import UIGraph2D from "../JavascriptUI/UIGraph2D.js";
export default class Calculation_LookupTable extends UITemplate {
    static displayName = `Lookup Table`;
    static output = `float`;
    static inputs = [`float`];
    static template = `<div data-element="dialog"></div>`
    GUID = generateGUID();

    get label() {
        return this.table.zLabel;
    }
    set label(label){
        this.table.zLabel = label;
        this.dialog.title = label;
    }

    _xLabel = `X`
    get xLabel() {
        return this._xLabel;
    }
    set xLabel(xLabel) {
        if(this._xLabel === xLabel)
            return;

        this._xLabel = xLabel;
        if(!this.parameterSelection)
            this.table.xLabel = xLabel;
    }

    get xOptions() {
        if(!this.parameterSelection) 
            return;

        return this.parameterSelection.options;
    }
    set xOptions(options) {
        if(!this.parameterSelection || objectTester(this.parameterSelection.options, options)) 
            return;

        this.parameterSelection.options = options;
    }

    get noParameterSelection() {
        if(this.parameterSelection)
            return false;
        return true;
    }
    set noParameterSelection(noParameterSelection) {
        if(noParameterSelection) {
            this.parameterSelection = undefined;
            this.table.xLabel = this.xLabel;
            return;
        }

        const thisClass = this;
        if(!this.parameterSelection) {
            this.parameterSelection = new UISelection({
                options: GetSelections(),
                class: `TableParameterSelect`
            });
            this.table.xLabel = this.parameterSelection;
        }
    }

    get value() {
        let value = super.value;
        value.table = this.table.saveValue;
        value.type = `Calculation_LookupTable`;
        delete value.graph;
        return value;
    }
    set value(value) {
        value.table = value.graph = value.table.value;
        super.value = value;
    }

    get saveValue() {
        let saveValue = super.saveValue;
        delete saveValue.graph;
        return saveValue;
    }
    set saveValue(saveValue) {
        saveValue.graph = saveValue.table;
        super.saveValue = saveValue;
    }

    constructor(prop) {
        super();
        this.dialog = new UIDialog({
            buttonLabel: `Edit Table`,
        });
        this.table = new UITable({
            selectNotVisible: true,
            yResolution: 1,
            yResolutionModifiable: false,
            BaseObj: true
        });
        this.graph = new UIGraph2D({
            width: Math.min(Math.max(600, this.table.xResolution * 100), 1000),
            height: 450
        });
        const thisClass = this;
        this.graph.addEventListener(`change`, function() {
            thisClass.graph.width = Math.min(Math.max(600, thisClass.graph.xResolution * 75), 1000);
        })
        this.table.attachToTable(this.graph);
        this.graph.attachToTable(this.table);
        this.dialog.content.append(this.graph);
        this.dialog.content.append(document.createElement(`br`));
        this.dialog.content.append(this.table);
        this.noParameterSelection = false;
        this.label = `Value`;
        this.Setup(prop);
    }

    GetObjOperation(result, inputVariableId) {
        let obj = this.value;
        obj.result = result;
        obj.inputVariables = [ inputVariableId ];

        return obj;
    }

    RegisterVariables() {
        this.xOptions = GetSelections();
        if(VariablesToPoll.indexOf(this.parameterSelection?.value?.reference) === -1)
            VariablesToPoll.push(this.parameterSelection?.value?.reference);
        
        const thisClass = this;
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.parameterSelection?.value?.reference) { 
                const parameterVariableId = VariableMetadata.GetVariableId(thisClass.parameterSelection?.value?.reference);
                if(CurrentVariableValues[parameterVariableId] !== undefined) {
                    thisClass.table.trail(CurrentVariableValues[parameterVariableId])
                } 
            }
        };
    }
}
GenericConfigs.push(Calculation_LookupTable);
customElements.define(`calculation-lookuptable`, Calculation_LookupTable, { extends: `span` });