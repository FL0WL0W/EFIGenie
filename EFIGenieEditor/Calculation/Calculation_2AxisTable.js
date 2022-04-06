import UITemplate from "../JavascriptUI/UITemplate.js";
import UISelection from "../JavascriptUI/UISelection.js";
import UIDialog from "../JavascriptUI/UIDialog.js";
import UITable from "../JavascriptUI/UITable.js";
import UIGraph3D from "../JavascriptUI/UIGraph3D.js";
export default class Calculation_2AxisTable extends UITemplate {
    static Name = `2 Axis Table`;
    static Output = `float`;
    static Inputs = [`float`, `float`];
    static Template = `<div data-element="Dialog"></div>`
    GUID = generateGUID();

    get label() {
        return this.Table.zLabel;
    }
    set label(label){
        this.Table.zLabel = label;
        this.Dialog.title = label;
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
            this.Table.xLabel = xLabel;
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
            this.Table.yLabel = yLabel;
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
            this.Table.xLabel = this.xLabel;
            this.Table.yLabel = this.yLabel;
            return;
        }

        const thisClass = this;
        if(!this.XSelection) {
            this.XSelection = new UISelection({
                selectNotVisible: true,
                options: GetSelections(),
            });
            this.XSelection.addEventListener(`change`, function() {
                thisClass.XReference = `${thisClass.XSelection.Value.reference}.${thisClass.XSelection.Value.value}${thisClass.XSelection.Value.measurement? `(${thisClass.XSelection.Value.measurement})` : ``}`;
            })
            this.Table.xLabel = this.XSelection;
        }
        if(!this.YSelection) {
            this.YSelection = new UISelection({
                selectNotVisible: true,
                options: GetSelections(),
            });
            this.YSelection.addEventListener(`change`, function() {
                thisClass.YReference = `${thisClass.YSelection.Value.reference}.${thisClass.YSelection.Value.value}${thisClass.YSelection.Value.measurement? `(${thisClass.YSelection.Value.measurement})` : ``}`;
            })
            this.Table.yLabel = this.YSelection;
        }
    }

    get saveValue() {
        return super.saveValue;
    }
    set saveValue(saveValue) {
        super.saveValue = saveValue;
        if(!saveValue.Table)
            this.Table.saveValue = saveValue;
    }
    
    constructor(prop) {
        super();
        this.Dialog = new UIDialog({
            buttonLabel: `Edit Table`,
        });
        this.Table = new UITable();
        this.Graph = new UIGraph3D({
            width: 800,
            height: 450
        });
        delete this.Graph.saveValue;
        this.Table.attachToTable(this.Graph);
        this.Graph.attachToTable(this.Table);
        this.Dialog.content.append(this.Graph);
        this.Dialog.content.append(document.createElement(`br`));
        this.Dialog.content.append(this.Table);
        this.noParameterSelection = false;
        this.label = `Value`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId, xVariableId, yVariableId) {
        const table = this.Table;
        const tableValue = table.Value;
        const type = GetArrayType(tableValue);
        const typeId = GetTypeId(type);

        var obj = {
            value: [
                { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Table }, //factory ID
                { type: `FLOAT`, value: table.xAxis[0] }, //MinXValue
                { type: `FLOAT`, value: table.xAxis[table.xResolution-1] }, //MaxXValue
                { type: `FLOAT`, value: table.yAxis[0] }, //MinYValue
                { type: `FLOAT`, value: table.yAxis[table.yResolution-1] }, //MaxYValue
                { type: `UINT8`, value: table.xResolution }, //xResolution
                { type: `UINT8`, value: table.yResolution }, //yResolution
                { type: `UINT8`, value: typeId }, //Type
                { type: type, value: tableValue }, //Table
            ]
        };

        if (!this.noParameterSelection || outputVariableId || xVariableId || yVariableId) {
            var inputVariables;
            if(xVariableId) {
                inputVariables = [ xVariableId ]; //inputVariable
            } else if (!this.noParameterSelection) {
                const parameterSelection = this.XSelection.Value;
                inputVariables = [ `${parameterSelection.reference}.${parameterSelection.value}${parameterSelection.measurement? `(${parameterSelection.measurement})` : ``}` ]; //xVariable
            }
            if(yVariableId) {
                inputVariables.push({ yVariableId }); //ytVariable
            } else if (!this.noParameterSelection) {
                const parameterSelection = this.YSelection.Value;
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
                    thisClass.Table.trail(CurrentVariableValues[xVariableId], CurrentVariableValues[yVariableId])
                } 
            }
        };
    }
}
GenericConfigs.push(Calculation_2AxisTable);
customElements.define(`calculation-2axistable`, Calculation_2AxisTable, { extends: `span` });