import UITemplate from "../JavascriptUI/UITemplate.js"
import UISelection from "../JavascriptUI/UISelection.js"
import UIDialog from "../JavascriptUI/UIDialog.js"
import UIGraph2D from "../JavascriptUI/UIGraph2D.js"
import UITableWithUnit from "../UI/UITableWithUnit.js"
export default class Calculation_LookupTable extends UITemplate {
    static displayName = `Lookup Table`
    static outputTypes = [ `float` ]
    static inputTypes = [ `float` ]
    static template = `<div data-element="dialog"></div>`
    GUID = generateGUID()

    dialog = new UIDialog({ buttonLabel: `Edit Table`, })
    table = new UITableWithUnit({
        yResolution: 1,
        yResolutionModifiable: false
    })
    graph = new UIGraph2D({ width: Math.min(Math.max(600, this.table.xResolution * 100), 1000), height: 450 })
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
        if(!this.parameterSelection) this.table.xLabel = xLabel
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

    get xOptions() { return this.parameterSelection?.options }
    set xOptions(options) {
        if(!this.parameterSelection || objectTester(this.parameterSelection.options, options)) return
        this.parameterSelection.options = options
    }

    get noParameterSelection() {
        if(this.parameterSelection) return false
        return true
    }
    set noParameterSelection(noParameterSelection) {
        if(noParameterSelection) {
            this.parameterSelection = undefined
            this.table.xLabel = this.xLabel
            return
        }

        if(!this.parameterSelection) {
            this.parameterSelection = new UISelection({
                options: this.GetSelections(),
                class: `TableParameterSelect`
            })
            const thisClass = this
            this.parameterSelection.addEventListener(`change`, function() {
                const xUnit = thisClass.parameterSelection.selectedOption?.value.unit
                if(thisClass._inputUnits?.[0] == undefined)
                    thisClass.xMeasurement = GetMeasurementNameFromUnitName(xUnit)
                thisClass.xUnit = xUnit
            })
            this.table.xLabel = this.parameterSelection
        } else {
            if(this._inputUnits?.[0] == undefined)
                this.xMeasurement = undefined
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
    }
    get outputUnits() { return [ this.valueUnit ] }
    set outputUnits(outputUnits) { 
        this.valueUnit = outputUnits?.[0]
        if(outputUnits?.[0] != undefined)
            this.measurement = GetMeasurementNameFromUnitName(outputUnits?.[0])
    }
    get displayUnits() { return [ this.displayUnit ] }
    set displayUnits(displayUnits) { this.displayUnit = displayUnits?.[0] }

    RegisterVariables() {
        this.xOptions = this.GetSelections()
        if(communication.variablesToPoll.indexOf(this.parameterSelection?.value) === -1)
            communication.variablesToPoll.push(this.parameterSelection?.value)
        
        const thisClass = this
        communication.liveUpdateEvents[this.GUID] = function(variableMetadata, currentVariableValues) {
            if(thisClass.parameterSelection?.value) { 
                const parameterVariableId = variableMetadata.GetVariableId(thisClass.parameterSelection?.value)
                if(currentVariableValues[parameterVariableId] != undefined) {
                    thisClass.table.trail(currentVariableValues[parameterVariableId])
                } 
            }
        }
    }

    GetSelections() {
        let gotoptions = GetSelections(undefined, defaultFilter(this._inputUnits, [ `float` ]))
        let options = []
        for(let topOptionIndex in gotoptions) {
            const topOption = gotoptions[topOptionIndex]
            if(topOption.group) {
                let group = { group: topOption.group, options: []}
                for(let optionIndex in topOption.options) {
                    const option = topOption.options[optionIndex]
                    let found = group.options.find(x=> x.name === option.name && x.value.name === option.value.name)
                    if(found) {
                        if(Array.isArray(found.value.unit)) {
                            if(found.value.unit.indexOf(option.value.unit) < 0)
                                found.value.unit.push(option.value.unit)
                        } else if (found.value.unit !== option.value.unit)
                            found.value.unit = [ found.value.unit, option.value.unit ]
                    } else {
                        group.options.push({...option, info: undefined})
                    }
                }
                options.push(group)
            } else {
                let found = options.find(x=> x.name === topOption.name && x.value.name === topOption.value.name)
                if(found) {
                    if(Array.isArray(found.value.unit)) {
                        if(found.value.unit.indexOf(topOption.value.unit) < 0)
                            found.value.unit.push(topOption.value.unit)
                    } else if (found.value.unit !== topOption.value.unit)
                        found.value.unit = [ found.value.unit, topOption.value.unit ]
                } else {
                    options.push({...topOption, info: undefined})
                }
            }
        }
        return options
    }
}
GenericConfigs.push(Calculation_LookupTable)
customElements.define(`calculation-lookuptable`, Calculation_LookupTable, { extends: `span` })