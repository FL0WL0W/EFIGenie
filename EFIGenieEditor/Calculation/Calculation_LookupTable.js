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
            this.parameterReference = undefined;
            this.parameterSelection = undefined;
            this.table.xLabel = this.xLabel;
            return;
        }

        const thisClass = this;
        if(!this.parameterSelection) {
            this.parameterSelection = new UISelection({
                options: GetSelections(),
                Class: `TableParameterSelect`
            });
            this.parameterSelection.addEventListener(`change`, function() {
                const parameterSelectionValue = thisClass.parameterSelection.value;
                thisClass.parameterReference = `${parameterSelectionValue.reference}.${parameterSelectionValue.value}${parameterSelectionValue.measurement? `(${parameterSelectionValue.measurement})` : ``}`;
            })
            this.table.xLabel = this.parameterSelection;
        }
    }

    get value() {
        return this.table.saveValue;
    }
    set value(value) {
        this.table.saveValue = value;
    }

    get saveValue() {
        let saveValue = super.saveValue;
        delete saveValue.graph;
        return saveValue;
    }
    set saveValue(saveValue) {
        saveValue.table ??= saveValue.Table;
        saveValue.parameterSelection ??= saveValue.ParameterSelection;
        super.saveValue = saveValue;
        if(!saveValue.table)
            this.table.saveValue = saveValue;
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

    GetObjOperation(outputVariableId, inputVariableId) {
        const table = this.value;
        const type = GetArrayType(table.value);
        const typeId = GetTypeId(type);

        var obj = {
            value: [
                { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LookupTable }, //factory ID
                { type: `FLOAT`, value: table.xAxis[0] }, //MinXValue
                { type: `FLOAT`, value: table.xAxis[table.xAxis.length-1] }, //MaxXValue
                { type: `UINT8`, value: table.xAxis.length }, //xResolution
                { type: `UINT8`, value: typeId }, //Type
                { type: type, value: table.value }, //Table
            ]
        };

        if (!this.noParameterSelection || outputVariableId || inputVariableId) {
            var inputVariables;
            if(inputVariableId) {
                inputVariables = [ inputVariableId ]; //inputVariable
            } else if (!this.noParameterSelection) {
                const parameterSelection = this.parameterSelection.value;
                inputVariables = [ `${parameterSelection.reference}.${parameterSelection.value}${parameterSelection.measurement? `(${parameterSelection.measurement})` : ``}` ]; //inputVariable
            }
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables
            });
        }

        return obj;
    }

    RegisterVariables() {
        this.xOptions = GetSelections();
        if(VariablesToPoll.indexOf(this.parameterReference) === -1)
            VariablesToPoll.push(this.parameterReference);
        
        const thisClass = this;
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.parameterReference) { 
                const parameterVariableId = VariableMetadata.GetVariableId(thisClass.parameterReference);
                if(CurrentVariableValues[parameterVariableId] !== undefined) {
                    thisClass.table.trail(CurrentVariableValues[parameterVariableId])
                } 
            }
        };
    }
}
GenericConfigs.push(Calculation_LookupTable);
customElements.define(`calculation-lookuptable`, Calculation_LookupTable, { extends: `span` });