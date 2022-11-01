import UITemplate from "../JavascriptUI/UITemplate.js"
import UISelection from "../JavascriptUI/UISelection.js"
import UIDialog from "../JavascriptUI/UIDialog.js"
import UIGraph3D from "../JavascriptUI/UIGraph3D.js"
import UITableWithUnit from "../UI/UITableWithUnit.js"
export default class Calculation_2AxisTable extends UITemplate {
    static displayName = `2 Axis Table`
    static outputTypes = [ `float` ]
    static inputTypes = [ `float`, `float` ]
    static template = `<div data-element="dialog"></div>`
    GUID = generateGUID()

    dialog = new UIDialog({ buttonLabel: `Edit Table` })
    table = new UITableWithUnit()
    graph = new UIGraph3D({ width: 800, height: 450 })
    constructor(prop) {
        super()
        const thisClass = this
        this.graph.addEventListener(`change`, function() {
            thisClass.graph.width = Math.min(Math.max(600, thisClass.graph.xResolution * 75), 1000)
        })
        this.table.attachToTable(this.graph)
        this.dialog.content.append(this.graph)
        this.dialog.content.append(document.createElement(`br`))
        this.dialog.content.append(this.table)
        this.noParameterSelection = false
        this.label = `Value`
        this.Setup(prop)
    }

    get label() { return this.table.zLabel }
    set label(label){
        this.table.zLabel = label
        this.dialog.title = label
    }

    _xLabel = `X`
    get xLabel() { return this._xLabel }
    set xLabel(xLabel) {
        if(this._xLabel === xLabel)
            return

        this._xLabel = xLabel
        if(!this.XSelection)
            this.table.xLabel = xLabel
    }

    _yLabel = `Y`
    get yLabel() { return this._yLabel }
    set yLabel(yLabel) {
        if(this._yLabel === yLabel) return
        this._yLabel = yLabel
        if(!this.YSelection) this.table.yLabel = yLabel
    }

    get xOptions() { return this.XSelection?.options }
    set xOptions(options) {
        if(!this.XSelection || objectTester(this.XSelection.options, options)) return
        this.XSelection.options = options
    }

    get yOptions() { return this.YSelection?.options }
    set yOptions(options) {
        if(!this.YSelection || objectTester(this.YSelection.options, options)) return
        this.YSelection.options = options
    }

    get noParameterSelection() {
        if(this.XSelection || this.YSelection) return false
        return true
    }
    set noParameterSelection(noParameterSelection) {
        if(noParameterSelection) {
            this.XSelection = undefined
            this.YSelection = undefined
            this.table.xLabel = this.xLabel
            this.table.yLabel = this.yLabel
            return
        }

        if(!this.XSelection) {
            this.XSelection = new UISelection({
                selectHidden: true,
                options: GetSelections(undefined, defaultFilter(undefined, [ `float` ])),
            })
            this.table.xLabel = this.XSelection
        }
        if(!this.YSelection) {
            this.YSelection = new UISelection({
                selectHidden: true,
                options: GetSelections(undefined, defaultFilter(undefined, [ `float` ])),
            })
            this.table.yLabel = this.YSelection
        }
    }

    get min() { return this.table.min }
    set min(min) { this.table.min = min }
    get max() { return this.table.max }
    set max(max) { this.table.max = max }
    get step() { return this.table.step }
    set step(step) { this.table.step = step }
    
    get displayUnit() { return this.table.displayUnit }
    set displayUnit(displayUnit) { this.table.displayValue = displayUnit }
    get displayValue() { return this.table.displayValue }
    set displayValue(displayValue) { this.table.displayValue = displayValue }
    get measurement() { return this.table.measurement }
    set measurement(measurement) { this.table.measurement = measurement }
    get valueUnit() { return this.table.valueUnit }
    set valueUnit(valueUnit) { this.table.valueUnit = valueUnit }
    get value() { return { ...super.value, table: this.table.saveValue, graph: undefined } }
    set value(value) { 
        value.table = value.graph = value.table.value
        super.value = value 
    }
    get saveValue() {
        let saveValue = super.saveValue
        delete saveValue.graph
        return saveValue
    }
    set saveValue(saveValue) {
        saveValue.graph = saveValue.table
        super.saveValue = saveValue
    }

    get outputTypes() { return this.outputUnits? undefined : this.constructor.outputTypes }
    _outputUnits
    get outputUnits() { return this._outputUnits ?? [ this.valueUnit ] }
    set outputUnits(outputUnits) { 
        this._outputUnits = outputUnits
        this.valueUnit = outputUnits?.[0]
        if(outputUnits?.[0] != undefined)
            this.measurement = GetMeasurementNameFromUnitName(outputUnits?.[0])
    }
    get displayUnits() { return [ this.displayUnit ] }
    set displayUnits(displayUnits) { this.displayUnit = displayUnits?.[0] }

    RegisterVariables() {
        this.xOptions = GetSelections(undefined, defaultFilter(undefined, [ `float` ]))
        this.yOptions = GetSelections(undefined, defaultFilter(undefined, [ `float` ]))
        if(communication.variablesToPoll.indexOf(this.XSelection?.value) === -1)
            communication.variablesToPoll.push(this.XSelection?.value)
        if(communication.variablesToPoll.indexOf(this.YSelection?.value) === -1)
            communication.variablesToPoll.push(this.YSelection?.value)
        const thisClass = this
        communication.liveUpdateEvents[this.GUID] = function(variableMetadata, currentVariableValues) {
            if(thisClass.XSelection?.value && thisClass.YSelection?.value) { 
                const xVariableId = variableMetadata.GetVariableId(thisClass.XSelection?.value)
                const yVariableId = variableMetadata.GetVariableId(thisClass.YSelection?.value)
                if(currentVariableValues[xVariableId] != undefined && currentVariableValues[yVariableId] != undefined) {
                    thisClass.table.trail(currentVariableValues[xVariableId], currentVariableValues[yVariableId])
                } 
            }
        }
    }
}
GenericConfigs.push(Calculation_2AxisTable)
customElements.define(`calculation-2axistable`, Calculation_2AxisTable, { extends: `span` })