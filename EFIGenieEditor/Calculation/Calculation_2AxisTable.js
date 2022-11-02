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

    get xResolutionModifiable() { return this.table.xResolutionModifiable }
    set xResolutionModifiable(xResolutionModifiable) { this.table.xResolutionModifiable = xResolutionModifiable }
    get xResolution() { return this.table.xResolution }
    set xResolution(xResolution) { this.table.xResolution = xResolution }
    _xLabel = `X`
    get xLabel() { return this._xLabel }
    set xLabel(xLabel) {
        if(this._xLabel === xLabel) return
        this._xLabel = xLabel
        if(!this.XSelection) this.table.xLabel = xLabel
    }
    get xMeasurement() { return this.table.xMeasurement }
    set xMeasurement(xMeasurement) { this.table.xMeasurement = xMeasurement }
    get xDisplayUnit() { return this.table.xDisplayUnit }
    set xDisplayUnit(xDisplayUnit) { this.table.xDisplayUnit = xDisplayUnit }
    get xDisplayAxis() { return this.table.xDisplayAxis }
    set xDisplayAxis(xDisplayAxis) { this.table.xDisplayAxis = xDisplayAxis }
    get xUnit() { return this.table.xUnit }
    set xUnit(xUnit) { 
        this.table.xUnit = xUnit 
    }
    get xAxis() { return this.table.xAxis }
    set xAxis(xAxis) { this.table.xAxis = xAxis }

    get yResolutionModifiable() { return this.table.yResolutionModifiable }
    set yResolutionModifiable(yResolutionModifiable) { this.table.yResolutionModifiable = yResolutionModifiable }
    get yResolution() { return this.table.yResolution }
    set yResolution(yResolution) { this.table.yResolution = yResolution }
    _yLabel = `Y`
    get yLabel() { return this._yLabel }
    set yLabel(yLabel) {
        if(this._yLabel === yLabel) return
        this._yLabel = yLabel
        if(!this.YSelection) this.table.yLabel = yLabel
    }
    get yMeasurement() { return this.table.yMeasurement }
    set yMeasurement(yMeasurement) { this.table.yMeasurement = yMeasurement }
    get yDisplayUnit() { return this.table.yDisplayUnit }
    set yDisplayUnit(yDisplayUnit) { this.table.yDisplayUnit = yDisplayUnit }
    get yDisplayAxis() { return this.table.yDisplayAxis }
    set yDisplayAxis(yDisplayAxis) { this.table.yDisplayAxis = yDisplayAxis }
    get yUnit() { return this.table.yUnit }
    set yUnit(yUnit) { 
        this.table.yUnit = yUnit 
    }
    get yAxis() { return this.table.yAxis }
    set yAxis(yAxis) { this.table.yAxis = yAxis }

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

        const thisClass = this
        if(!this.XSelection) {
            this.XSelection = new UISelection({
                selectHidden: true,
                options: GetSelections(undefined, defaultFilter([this._inputUnits?.[0]], [ `float` ])),
            })
            this.XSelection.addEventListener(`change`, function() {
                thisClass.xUnit = thisClass.XSelection.selectedOption?.value.unit
                if(thisClass._inputUnits?.[0] == undefined)
                    thisClass.xMeasurement = GetMeasurementNameFromUnitName(thisClass.xUnit)
            })
            this.table.xLabel = this.XSelection
        } else {
            if(this._inputUnits?.[0] == undefined)
                this.xMeasurement = undefined
        }
        if(!this.YSelection) {
            this.YSelection = new UISelection({
                selectHidden: true,
                options: GetSelections(undefined, defaultFilter([this._inputUnits?.[1]], [ `float` ])),
            })
            this.YSelection.addEventListener(`change`, function() {
                thisClass.yUnit = thisClass.YSelection.selectedOption?.value.unit
                if(thisClass._inputUnits?.[1] == undefined)
                    thisClass.yMeasurement = GetMeasurementNameFromUnitName(thisClass.yUnit)
            })
            this.table.yLabel = this.YSelection
        } else {
            if(this._inputUnits?.[1] == undefined)
                this.yMeasurement = undefined
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

    _inputUnits
    get inputUnits() { return [ this.xUnit ] }
    set inputUnits(inputUnits) {
        this._inputUnits = inputUnits?.[0]
        this.xOptions = defaultFilter(this._inputUnits, [ `float` ])
        this.xUnit = inputUnits?.[0]
        if(inputUnits?.[0] != undefined)
            this.xMeasurement = GetMeasurementNameFromUnitName(inputUnits?.[0])
        if(inputUnits?.[1] != undefined)
            this.yMeasurement = GetMeasurementNameFromUnitName(inputUnits?.[1])
    }
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
        this.xOptions = GetSelections(undefined, defaultFilter([this._inputUnits?.[0]], [ `float` ]))
        this.yOptions = GetSelections(undefined, defaultFilter([this._inputUnits?.[1]], [ `float` ]))
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