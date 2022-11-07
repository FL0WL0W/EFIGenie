import UITemplate from "../JavascriptUI/UITemplate.js"
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js"
import UIParameterWithUnit from "../UI/UIParameterWithUnit.js"
export default class CalculationOrVariableSelection extends UITemplate {
    static template = `<label><span data-element="labelElement"></span>:</label><div data-element="selection"></div><div data-element="liveUpdate"></div><span data-element="calculationContent"></span>`
    calculationContent = document.createElement(`span`)
    calculationValues = []
    calculationSaveValueCache = []

    labelElement = document.createElement(`span`)
    get label() { return this.labelElement.textContent }
    set label(label) {
        if(this.label === label) return
        this.labelElement.textContent = label
        Object.keys(this.calculationValues).map(x=>this.calculationValues[x]).forEach(calculationValue => { calculationValue.label = label })
    }

    _xlabel = `X`
    get xLabel() { return this._xlabel }
    set xLabel(xlabel) {
        if(this._xlabel === xlabel) return
        this._xlabel = xlabel
        Object.keys(this.calculationValues).map(x=>this.calculationValues[x]).forEach(calculationValue => { calculationValue.xLabel = xlabel })
    }

    _ylabel = `Y`
    get yLabel() { return this._xlabel }
    set yLabel(ylabel) {
        if(this._ylabel === ylabel) return
        this._ylabel = ylabel
        Object.keys(this.calculationValues).map(x=>this.calculationValues[x]).forEach(calculationValue => { calculationValue.yLabel = ylabel })
    }

    selectionFilter = defaultFilter

    get outputTypes() {
        return  this._outputUnits? undefined : (
                    this._outputTypes ??                 
                    GetClassProperty(this.SubConfig, `outputTypes`) ?? 
                    (this.selection.value?.unit != undefined? undefined : (
                        [ this.selection.value?.type ]
                    ))
                )
    }
    set outputTypes(outputTypes) {
        this._outputTypes = outputTypes
        Object.keys(this.calculationValues).map(x=>this.calculationValues[x]).forEach(calculationValue => {
            if(`outputTypes` in calculationValue)
                calculationValue.outputTypes = outputTypes
        })
        this.options = GetSelections(this.calculations, this.selectionFilter(this._outputUnits, this._outputTypes, this._inputTypes, this._inputUnits))
    }

    get outputUnits() {
        return  this._outputUnits ?? 
                GetClassProperty(this.SubConfig, `outputUnits`) ??      
                (this.selection.displayUnit != undefined? (
                    [ this.selection.displayUnit ]
                ) : undefined)
    }
    set outputUnits(outputUnits) {
        this._outputUnits = outputUnits
        Object.keys(this.calculationValues).map(x=>this.calculationValues[x]).forEach(calculationValue => {
            if(`outputUnits` in calculationValue)
                calculationValue.outputUnits = outputUnits
        })
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
        Object.keys(this.calculationValues).map(x=>this.calculationValues[x]).forEach(calculationValue => {
            if(`inputTypes` in calculationValue)
                calculationValue.inputTypes = inputTypes
        })
        this.options = GetSelections(this.calculations, this.selectionFilter(this._outputUnits, this._outputTypes, this._inputTypes, this._inputUnits))
    }

    get inputUnits() {
        return  this._inputUnits ?? 
                GetClassProperty(this.SubConfig, `inputUnits`)
    }
    set inputUnits(inputUnits) {
        this._inputUnits = inputUnits
        Object.keys(this.calculationValues).map(x=>this.calculationValues[x]).forEach(calculationValue => {
            if(`inputUnits` in calculationValue)
                calculationValue.inputUnits = inputUnits
        })
        this.options = GetSelections(this.calculations, this.selectionFilter(this._outputUnits, this._outputTypes, this._inputTypes, this._inputUnits))
    }

    get options() { return this.selection.options }    
    set options(options) {
        this.selection.options = options
        if(this.selection.selectedOption === undefined) 
            this.selection.value = this.selection.selectValue
    }

    selection = new UIParameterWithUnit({ selectDisabled: false, selectName: `None` })
    constructor(prop) {
        super()
        prop ??= {}
        this.liveUpdate = new UIDisplayLiveUpdate({
            valueUnit: prop.outputUnits?.[0],
            displayUnit: prop.displayUnits?.[0]
        })
        this.liveUpdate.style.float = `right`
        this.selection.addEventListener(`change`, () => {
            this.calculationContent.replaceChildren(this.SubConfig ?? ``)
            this.liveUpdate.measurement = GetMeasurementNameFromUnitName(this.outputUnits?.[0])
            if(this._outputUnits?.[0] == undefined)
                this.selection.unitHidden = false
            else
                this.selection.unitHidden = true
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
        saveValue.calculationValues = {}

        if(CalculationOrVariableSelection.SaveOnlyActive) {
            let subConfigSaveValue = subConfig?.saveValue
            if(subConfigSaveValue != undefined) 
                saveValue.calculationValues[this.selection.value] = subConfigSaveValue
        } else {
            for(const className in this.calculationValues) {
                saveValue.calculationValues[className] = this.calculationValues[className].saveValue
            }
            for(const className in this.calculationSaveValueCache) {
                saveValue.calculationValues[className] = this.calculationSaveValueCache[className]
            }
        }
        if(Object.keys(saveValue.calculationValues).length < 1)
            delete saveValue.calculationValues

        if(typeof this.selection.value !== `string`)
            saveValue.displayUnit = this.selection.displayUnit

        return saveValue
    }

    set saveValue(saveValue) {
        saveValue ??= {}

        //legacy save files used an array of calculation values instead of an object with keys
        if(Array.isArray(saveValue.calculationValues)) {
            for (const i in saveValue.calculationValues) {
                const className = saveValue.calculationValues[i]?.className
                if(className == undefined)
                    continue

                if(this.calculationValues[className])
                    this.calculationValues[className].saveValue = saveValue.calculationValues[i]
                else
                    this.calculationSaveValueCache[className] = saveValue.calculationValues[i]
            }
        } else if (saveValue.calculationValues) {
            for(const className in saveValue.calculationValues) {
                if(this.calculationValues[className])
                    this.calculationValues[className].saveValue = saveValue.calculationValues[className]
                else
                    this.calculationSaveValueCache[className] = saveValue.calculationValues[className]
            }
        }

        super.saveValue = saveValue

        this.selection.displayUnit = saveValue.displayUnit
    }

    get value() {
        const subConfig = this.SubConfig
        return {
            ...super.value,
            outputTypes: this.outputTypes,
            outputUnits: this.outputUnits,
            inputTypes: this.inputTypes,
            inputUnits: this.inputUnits,
            ...(subConfig != undefined) && {calculation: subConfig.value}
        }
    }

    set value(value) {
        this.selection.value = value?.selection
        const subConfig = this.SubConfig
        if(subConfig)
            subConfig.value = value?.calculation
        this.selection.displayUnit = value?.outputUnits?.[0]
    }

    RegisterVariables(reference) {
        reference = { ...reference }
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
        if(subConfig != undefined) {
            const hasOutput = (GetClassProperty(subConfig, `outputUnits`) ?? GetClassProperty(subConfig, `outputTypes`)) != undefined
            if (hasOutput) VariableRegister.RegisterVariable(reference)
            subConfig.RegisterVariables?.(reference)
        } else {
            reference = { ...this.selection.value, name: reference.name, id: this.selection.value.name }
            VariableRegister.RegisterVariable(reference)
        }

        this.liveUpdate.RegisterVariables(reference)
    }

    get SubConfig() {
        if (typeof this.selection.value !== `string` || !this.calculations) return undefined
        if (this.calculationValues[this.selection.value])
            return this.calculationValues[this.selection.value]

        //create if it does not exist
        let calculationGroups = this.calculations
        if(!this.calculations[0]?.group && !this.calculations[0]?.calculations)
            calculationGroups = [{ group: `Calculations`, calculations: this.calculations }]
        for(const c in calculationGroups) {
            const calculations = calculationGroups[c].calculations
    
            for (const i in calculations) {
                if (calculations[i] == undefined || calculations[i].name !== this.selection.value)
                    continue

                this.calculationValues[this.selection.value] = new calculations[i]()
                this.calculationValues[this.selection.value].Setup({
                    noParameterSelection: this.noParameterSelection,
                    label: this.label,
                    xLabel: this.xLabel,
                    yLabel: this.yLabel,
                    ...(this._outputUnits && { outputUnits: this._outputUnits }),
                    displayUnits: this.displayUnits,
                    calculations: this.calculations
                })
                if(this.calculationSaveValueCache[this.selection.value] != undefined)
                    this.calculationValues[this.selection.value].saveValue = this.calculationSaveValueCache[this.selection.value]
                delete this.calculationSaveValueCache[this.selection.value]
                return this.calculationValues[this.selection.value]
            }
        }
    }
}
customElements.define(`calculation-orvariableselection`, CalculationOrVariableSelection, { extends: `span` })