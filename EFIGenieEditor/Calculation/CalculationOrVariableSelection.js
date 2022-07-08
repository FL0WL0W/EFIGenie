import UITemplate from "../JavascriptUI/UITemplate.js"
import UISelection from "../JavascriptUI/UISelection.js"
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js"
export default class CalculationOrVariableSelection extends UITemplate {
    static template = `<label><span data-element="labelElement"></span>:</label><div data-element="selection"></div><div data-element="liveUpdate"></div><span data-element="calculationContent"></span>`
    calculationContent = document.createElement(`span`)
    calculationValues = []

    labelElement = document.createElement(`span`)
    get label() { return this.labelElement.textContent }
    set label(label) {
        if(this.label === label) return
        this.labelElement.textContent = label
        this.calculationValues.forEach(function(configValue) { configValue.label = label })
    }

    _xlabel = `X`
    get xLabel() { return this._xlabel }
    set xLabel(xlabel) {
        if(this._xlabel === xlabel) return
        this._xlabel = xlabel
        this.calculationValues.forEach(function(configValue) { configValue.xLabel = xlabel })
    }

    _ylabel = `Y`
    get yLabel() { return this._xlabel }
    set yLabel(ylabel) {
        if(this._ylabel === ylabel) return
        this._ylabel = ylabel
        this.calculationValues.forEach(function(configValue) { configValue.yLabel = ylabel })
    }

    selectionFilter = defaultFilter

    get outputTypes() {
        return  this._outputUnits? undefined : (
                    this._outputTypes ??                 
                    GetClassProperty(this.SubConfig, `outputTypes`) ?? 
                    (this.selection.value?.unit !== undefined? undefined : (
                        [ this.selection.value?.type ]
                    ))
                )
    }
    set outputTypes(outputTypes) {
        this._outputTypes = outputTypes
        this.options = GetSelections(this.calculations, this.selectionFilter(this._outputUnits, this._outputTypes, this._inputTypes, this._inputUnits))
    }

    get outputUnits() {
        return  this._outputUnits ?? 
                GetClassProperty(this.SubConfig, `outputUnits`) ??      
                (this.selection.value?.unit !== undefined? undefined : (
                    [ this.selection.value?.unit ]
                ))
    }
    set outputUnits(outputUnits) {
        this._outputUnits = outputUnits
        this.options = GetSelections(this.calculations, this.selectionFilter(this._outputUnits, this._outputTypes, this._inputTypes, this._inputUnits))
    }

    get inputTypes() {
        return  this._inputUnits? undefined : (
                    this._inputTypes ??                 
                    GetClassProperty(this.SubConfig, `inputTypes`)
                )
    }
    set inputTypes(inputTypes) {
        this._inputTypes = inputTypes
        this.options = GetSelections(this.calculations, this.selectionFilter(this._outputUnits, this._outputTypes, this._inputTypes, this._inputUnits))
    }

    get inputUnits() {
        return  this._inputUnits ?? 
                GetClassProperty(this.SubConfig, `inputUnits`)
    }
    set inputUnits(inputUnits) {
        this._inputUnits = inputUnits
        this.options = GetSelections(this.calculations, this.selectionFilter(this._outputUnits, this._outputTypes, this._inputTypes, this._inputUnits))
    }

    get options() { return this.selection.options }    
    set options(options) {
        this.selection.options = options
        let match = false
        let stringValue = UISelection.ParseValue(`string`, this.selection.value)
        this.selection.options.forEach(option => {
            if(option.group){
                option.options.forEach(option => {
                    if(UISelection.ParseValue(`string`, option.value) === stringValue)
                        match = true
                })
            } else {
                if(UISelection.ParseValue(`string`, option.value) === stringValue)
                    match = true
            }
        })

        if(!match) 
            this.selection.value = this.selection.selectValue

        // if(options.length < 2) {
        //     if(!match && options.length === 1)
        //         this.selection.value = options[0].value
        //     this.selection.hidden = true
        // } else {
        //     this.selection.hidden = false
        // }
    }

    selection = new UISelection({ selectDisabled: false, selectName: `None` })
    constructor(prop) {
        super()
        prop ??= {}
        this.liveUpdate = new UIDisplayLiveUpdate({
            valueUnit: prop.outputUnits?.[0],
            displayUnit: prop.displayUnits?.[0]
        })
        this.liveUpdate.style.float = `right`
        var thisClass = this
        this.selection.addEventListener(`change`, function() {
            thisClass.calculationContent.replaceChildren(thisClass.SubConfig ?? ``)
            thisClass.liveUpdate.valueUnit = thisClass.outputUnits?.[0]
        })
        this.style.display = `block`
        this.Setup(prop)
    }

    Setup(...args) {
        super.Setup(...args)
        this.options = GetSelections(this.calculations, this.selectionFilter(this._outputUnits, this._outputTypes, this._inputTypes, this._inputUnits))
    }

    static SaveOnlyActive = false
    get saveValue() {
        let saveValue = super.saveValue ?? {}

        if (this.calculationValues && this.calculationValues.length > 0) {
            if(CalculationOrVariableSelection.SaveOnlyActive) {
                var subConfig = this.SubConfig
                if(subConfig?.saveValue !== undefined) {
                    var configValue = subConfig.saveValue
                    if(typeof configValue !== `object`)
                        configValue = { value: configValue }
                    configValue.className = subConfig.constructor.name
                    saveValue.calculationValues = [ configValue ]
                }
            } else {
                saveValue.calculationValues = []
                for (var i = 0; i < this.calculationValues.length; i++) {
                    var configValue = this.calculationValues[i].saveValue
                    if(typeof configValue !== `object`)
                        configValue = { value: configValue }
                    configValue.className = this.calculationValues[i].constructor.name
                    saveValue.calculationValues.push(configValue)
                }
            } 
        }
        if(saveValue.calculationValues?.length < 1)
            delete saveValue.calculationValues

        return saveValue
    }

    set saveValue(saveValue) {
        saveValue ??= {}
        
        for (var i = 0; i < saveValue.calculationValues?.length ?? 0; i++) {
            var found = false
            for (var t = 0; t < this.calculationValues.length; t++) {
                if (saveValue.calculationValues[i].className === this.calculationValues[i]?.constructor.name){
                    this.calculationValues[t].saveValue = saveValue.calculationValues[i]
                    found = true
                    break
                }
            }
            if (!found && this.calculations) {
                var configGroups = this.calculations
                if(!this.calculations[0]?.group && !this.calculations[0]?.calculations)
                    configGroups = [{ group: `Calculations`, calculations: this.calculations }]
        
                for(var c = 0; c < configGroups.length; c++) {
                    const calculations = configGroups[c].calculations
                    for (var t = 0; t < calculations.length; t++) {
                        if (saveValue.calculationValues[i].className !== calculations[t].name)
                            continue
                        this.calculationValues.push(new calculations[t]({
                            noParameterSelection: this.noParameterSelection,
                            label: this.label,
                            xLabel: this.xLabel,
                            yLabel: this.yLabel,
                            saveValue: saveValue.calculationValues[i],
                            outputUnits: this._outputUnits? undefined : this._outputUnits,
                            displayUnits: this.displayUnits,
                            calculations: this.calculations
                        }))
                    }
                }
            }
        }

        super.saveValue = saveValue
    }

    get value() {
        const subConfig = this.SubConfig
        return {
            ...super.value,
            ...(subConfig !== undefined) && {calculation: { 
                 ...subConfig.value, 
                ...(typeof subConfig.value !== `object`) && { value: subConfig.value },
                outputUnits: this.outputUnits
            }}
        }
    }

    set value(value) {
        this.selection.value = value?.selection
        const subConfig = this.SubConfig
        if(subConfig)
            subConfig.value = value?.calculation
    }

    RegisterVariables(reference) {
        this.options = GetSelections(this.calculations, this.selectionFilter(this._outputUnits, this._outputTypes, this._inputTypes, this._inputUnits))

        if (!this.selection.value || !reference) return

        reference.unit = this.outputUnits?.[0] ?? reference.unit
        if(reference.unit) {
            delete reference.type
        } else {
            delete reference.unit
            reference.type = this.outputTypes?.[0] ?? reference.type
        }
        
        const subConfig = this.SubConfig
        if(subConfig !== undefined) {
            const hasOutput = (GetClassProperty(subConfig, `outputUnits`) ?? GetClassProperty(subConfig, `outputTypes`)) !== undefined
            if (hasOutput) VariableRegister.RegisterVariable(reference)
            subConfig.RegisterVariables?.(reference)
        } else {
            reference = { ...this.selection.value, name: reference.name, id: this.selection.value.name }
            VariableRegister.RegisterVariable(reference)
        }

        this.liveUpdate.RegisterVariables(reference)
    }

    get SubConfigIndex() {
        if (typeof this.selection.value !== `string` || !this.calculations)
            return -1

        for (var i = 0; i < this.calculationValues.length; i++) {
            if (this.calculationValues[i].constructor.name === this.selection.value) {
                return i
            }
        }
        var configGroups = this.calculations
        if(!this.calculations[0]?.group && !this.calculations[0]?.calculations)
            configGroups = [{ group: `Calculations`, calculations: this.calculations }]
        for(var c = 0; c < configGroups.length; c++) {
            const calculations = configGroups[c].calculations
    
            for (var i = 0; i < calculations.length; i++) {
                if (calculations[i] === undefined || calculations[i].name !== this.selection.value)
                    continue
                this.calculationValues.push(new calculations[i]({
                    noParameterSelection: this.noParameterSelection,
                    label: this.label,
                    xLabel: this.xLabel,
                    yLabel: this.yLabel,
                    outputUnits: this._outputUnits? undefined : this._outputUnits,
                    displayUnits: this.displayUnits,
                    calculations: this.calculations
                }))
                return this.calculationValues.length-1
            }
        }
    }

    get SubConfig() {
        return this.calculationValues[this.SubConfigIndex]
    }
}
customElements.define(`calculation-orvariableselection`, CalculationOrVariableSelection, { extends: `span` })