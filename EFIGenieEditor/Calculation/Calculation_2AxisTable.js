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
            this.XReference = undefined;
            this.YReference = undefined;
            this.XSelection = undefined;
            this.YSelection = undefined;
            this.table.xLabel = this.xLabel;
            this.table.yLabel = this.yLabel;
            return;
        }

        const thisClass = this;
        if(!this.XSelection) {
            this.XSelection = new UISelection({
                selectNotVisible: true,
                options: GetSelections(),
            });
            this.XSelection.addEventListener(`change`, function() {
                const xSelectionValue = thisClass.XSelection.value;
                thisClass.XReference = `${xSelectionValue.reference}.${xSelectionValue.value}${xSelectionValue.measurement? `(${xSelectionValue.measurement})` : ``}`;
            })
            this.table.xLabel = this.XSelection;
        }
        if(!this.YSelection) {
            this.YSelection = new UISelection({
                selectNotVisible: true,
                options: GetSelections(),
            });
            this.YSelection.addEventListener(`change`, function() {
                const ySelectionValue = thisClass.YSelection.value;
                thisClass.YReference = `${ySelectionValue.reference}.${ySelectionValue.value}${ySelectionValue.measurement? `(${ySelectionValue.measurement})` : ``}`;
            })
            this.table.yLabel = this.YSelection;
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
        super.saveValue = saveValue;
        if(!saveValue.table)
            this.table.saveValue = saveValue;
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

    GetObjOperation(outputVariableId, xVariableId, yVariableId) {
        const table = this.value;
        const type = GetArrayType(table.value);
        const typeId = GetTypeId(type);

        var obj = {
            value: [
                { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Table }, //factory ID
                { type: `FLOAT`, value: table.xAxis[0] }, //MinXValue
                { type: `FLOAT`, value: table.xAxis[table.xAxis.length-1] }, //MaxXValue
                { type: `FLOAT`, value: table.yAxis[0] }, //MinYValue
                { type: `FLOAT`, value: table.yAxis[table.yAxis.length-1] }, //MaxYValue
                { type: `UINT8`, value: table.xAxis.length }, //xResolution
                { type: `UINT8`, value: table.yAxis.length }, //yResolution
                { type: `UINT8`, value: typeId }, //Type
                { type: type, value: table.value }, //Table
            ]
        };

        if (!this.noParameterSelection || outputVariableId || xVariableId || yVariableId) {
            var inputVariables;
            if(xVariableId) {
                inputVariables = [ xVariableId ]; //inputVariable
            } else if (!this.noParameterSelection) {
                const parameterSelection = this.XSelection.value;
                inputVariables = [ `${parameterSelection.reference}.${parameterSelection.value}${parameterSelection.measurement? `(${parameterSelection.measurement})` : ``}` ]; //xVariable
            }
            if(yVariableId) {
                inputVariables.push({ yVariableId }); //ytVariable
            } else if (!this.noParameterSelection) {
                const parameterSelection = this.YSelection.value;
                inputVariables.push( `${parameterSelection.reference}.${parameterSelection.value}${parameterSelection.measurement? `(${parameterSelection.measurement})` : ``}` ); //yVariable
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
        this.yOptions = GetSelections();
        if(VariablesToPoll.indexOf(this.XReference) === -1)
            VariablesToPoll.push(this.XReference);
        if(VariablesToPoll.indexOf(this.YReference) === -1)
            VariablesToPoll.push(this.YReference);
        const thisClass = this;
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.XReference && thisClass.YReference) { 
                const xVariableId = VariableMetadata.GetVariableId(thisClass.XReference);
                const yVariableId = VariableMetadata.GetVariableId(thisClass.YReference);
                if(CurrentVariableValues[xVariableId] !== undefined && CurrentVariableValues[yVariableId] !== undefined) {
                    thisClass.table.trail(CurrentVariableValues[xVariableId], CurrentVariableValues[yVariableId])
                } 
            }
        };
    }
}
GenericConfigs.push(Calculation_2AxisTable);
customElements.define(`calculation-2axistable`, Calculation_2AxisTable, { extends: `span` });