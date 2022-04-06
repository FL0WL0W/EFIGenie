import UITemplate from "../JavascriptUI/UITemplate.js";
import UISelection from "../JavascriptUI/UISelection.js";
import UIDialog from "../JavascriptUI/UIDialog.js";
import UITable from "../JavascriptUI/UITable.js";
import UIGraph2D from "../JavascriptUI/UIGraph2D.js";
export default class Calculation_LookupTable extends UITemplate {
    static Name = `Lookup Table`;
    static Output = `float`;
    static Inputs = [`float`];
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
        if(!this.ParameterSelection)
            this.Table.xLabel = xLabel;
    }

    get xOptions() {
        if(!this.ParameterSelection) 
            return;

        return this.ParameterSelection.options;
    }
    set xOptions(options) {
        if(!this.ParameterSelection || objectTester(this.ParameterSelection.options, options)) 
            return;

        this.ParameterSelection.options = options;
    }

    get noParameterSelection() {
        if(this.ParameterSelection)
            return false;
        return true;
    }
    set noParameterSelection(noParameterSelection) {
        if(noParameterSelection) {
            this.ParameterReference = undefined;
            this.ParameterSelection = undefined;
            this.Table.xLabel = this.xLabel;
            return;
        }

        const thisClass = this;
        if(!this.ParameterSelection) {
            this.ParameterSelection = new UISelection({
                options: GetSelections(),
                Class: `TableParameterSelect`
            });
            this.ParameterSelection.addEventListener(`change`, function() {
                thisClass.ParameterReference = `${thisClass.ParameterSelection.Value.reference}.${thisClass.ParameterSelection.Value.value}${thisClass.ParameterSelection.Value.measurement? `(${thisClass.ParameterSelection.Value.measurement})` : ``}`;
            })
            this.Table.xLabel = this.ParameterSelection;
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
        const thisClass = this;
        this.Dialog = new UIDialog({
            buttonLabel: `Edit Table`,
        });
        this.TableGroup = `$Graph$</br>$Table$`;
        this.Table = new UITable({
            selectNotVisible: true,
            yResolution: 1,
            yResolutionModifiable: false,
            BaseObj: true
        });
        this.Graph = new UIGraph2D({
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

    GetObjOperation(outputVariableId, inputVariableId) {
        const table = this.Table;
        const tableValue = table.Value;
        const type = GetArrayType(tableValue);
        const typeId = GetTypeId(type);

        var obj = {
            value: [
                { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LookupTable }, //factory ID
                { type: `FLOAT`, value: table.xAxis[0] }, //MinXValue
                { type: `FLOAT`, value: table.xAxis[table.xResolution-1] }, //MaxXValue
                { type: `UINT8`, value: table.xResolution }, //xResolution
                { type: `UINT8`, value: typeId }, //Type
                { type: type, value: tableValue }, //Table
            ]
        };

        if (!this.noParameterSelection || outputVariableId || inputVariableId) {
            var inputVariables;
            if(inputVariableId) {
                inputVariables = [ inputVariableId ]; //inputVariable
            } else if (!this.noParameterSelection) {
                const parameterSelection = this.ParameterSelection.Value;
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
        if(VariablesToPoll.indexOf(this.ParameterReference) === -1)
            VariablesToPoll.push(this.ParameterReference);
        
        const thisClass = this;
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.ParameterReference) { 
                const parameterVariableId = VariableMetadata.GetVariableId(thisClass.ParameterReference);
                if(CurrentVariableValues[parameterVariableId] !== undefined) {
                    thisClass.Table.trail(CurrentVariableValues[parameterVariableId])
                } 
            }
        };
    }
}
GenericConfigs.push(Calculation_LookupTable);
customElements.define(`calculation-lookuptable`, Calculation_LookupTable, { extends: `span` });