import UITemplate from "../JavascriptUI/UITemplate.js";
import UISelection from "../JavascriptUI/UISelection.js";
import UIDialog from "../JavascriptUI/UIDialog.js";
import UITable from "../JavascriptUI/UITable.js";
import UIGraph3D from "../JavascriptUI/UIGraph3D.js";
export default class Calculation_2AxisTable extends UITemplate {
    static displayName = `2 Axis Table`;
    static output = `float`;
    static inputs = [`float`, `float`];
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
        if(!this.XSelection)
            this.table.xLabel = xLabel;
    }

    _yLabel = `Y`
    get yLabel() {
        return this._yLabel;
    }
    set yLabel(yLabel) {
        if(this._yLabel === yLabel)
            return;

        this._yLabel = yLabel;
        if(!this.YSelection)
            this.table.yLabel = yLabel;
    }

    get xOptions() {
        if(!this.XSelection) 
            return;

        return this.XSelection.options;
    }
    set xOptions(options) {
        if(!this.XSelection || objectTester(this.XSelection.options, options)) 
            return;

        this.XSelection.options = options;
    }

    get yOptions() {
        if(!this.YSelection) 
            return;

        return this.YSelection.options;
    }
    set yOptions(options) {
        if(!this.YSelection || objectTester(this.YSelection.options, options)) 
            return;

        this.YSelection.options = options;
    }

    get noParameterSelection() {
        if(this.XSelection || this.YSelection)
            return false;
        return true;
    }
    set noParameterSelection(noParameterSelection) {
        if(noParameterSelection) {
            this.XSelection = undefined;
            this.YSelection = undefined;
            this.table.xLabel = this.xLabel;
            this.table.yLabel = this.yLabel;
            return;
        }

        if(!this.XSelection) {
            this.XSelection = new UISelection({
                selectNotVisible: true,
                options: GetSelections(),
            });
            this.table.xLabel = this.XSelection;
        }
        if(!this.YSelection) {
            this.YSelection = new UISelection({
                selectNotVisible: true,
                options: GetSelections(),
            });
            this.table.yLabel = this.YSelection;
        }
    }

    get value() { return { ...super.value, table: this.table.saveValue, graph: undefined, type: `Calculation_2AxisTable` } }
    set value(value) { 
        value.table = value.graph = value.table.value
        super.value = value 
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
        this.table = new UITable();
        this.graph = new UIGraph3D({
            width: 800,
            height: 450
        });
        this.table.attachToTable(this.graph);
        this.graph.attachToTable(this.table);
        const thisClass = this;
        this.graph.addEventListener(`change`, function() {
            thisClass.graph.width = Math.min(Math.max(600, thisClass.graph.xResolution * 75), 1000);
        })
        this.dialog.content.append(this.graph);
        this.dialog.content.append(document.createElement(`br`));
        this.dialog.content.append(this.table);
        this.noParameterSelection = false;
        this.label = `Value`;
        this.Setup(prop);
    }

    RegisterVariables() {
        this.xOptions = GetSelections();
        this.yOptions = GetSelections();
        if(VariablesToPoll.indexOf(this.XSelection?.value?.reference) === -1)
            VariablesToPoll.push(this.XSelection?.value?.reference);
        if(VariablesToPoll.indexOf(this.YSelection?.value?.reference) === -1)
            VariablesToPoll.push(this.YSelection?.value?.reference);
        const thisClass = this;
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.XSelection?.value?.reference && thisClass.YSelection?.value?.reference) { 
                const xVariableId = VariableMetadata.GetVariableId(thisClass.XSelection?.value?.reference);
                const yVariableId = VariableMetadata.GetVariableId(thisClass.YSelection?.value?.reference);
                if(CurrentVariableValues[xVariableId] !== undefined && CurrentVariableValues[yVariableId] !== undefined) {
                    thisClass.table.trail(CurrentVariableValues[xVariableId], CurrentVariableValues[yVariableId])
                } 
            }
        };
    }
}
GenericConfigs.push(Calculation_2AxisTable);
customElements.define(`calculation-2axistable`, Calculation_2AxisTable, { extends: `span` });