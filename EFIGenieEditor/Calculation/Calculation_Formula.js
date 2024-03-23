
import UITemplate from "../JavascriptUI/UITemplate.js"
import UIDialog from "../JavascriptUI/UIDialog.js"
import UIText from "../JavascriptUI/UIText.js"
import UIUnit from "../UI/UIUnit.js"
export default class Calculation_Formula extends UITemplate {
    static displayName = `Formula`
    static outputTypes = [ `bool|float` ]
    static template = `<div data-element="editFormula"></div><div data-element="editFormulaContent"><div style="display: flex; width: 100%"><div style="margin: auto; margin-right: 1em; width: fit-content; white-space: nowrap;"><div data-element="labelElement"></div> <div data-element="formulaUnit"></div> = </div><div data-element="formula"></div></div><div data-element="parameterElements"></div></div><div data-element="parameterValueElements"></div>`

    get outputUnits() { return [ this.formulaUnit.textContent ] }
    set outputUnits(outputUnits) { this.formulaUnit.textContent = outputUnits?.[0] }

    labelElement = document.createElement(`span`)
    formulaUnit = document.createElement(`span`)
    editFormula = new UIDialog({ buttonLabel: `Edit Formula` })
    formula = new UIText({ class: `formula` })
    parameterElements = document.createElement(`div`)
    parameterValueElements = document.createElement(`div`)

    parameterValues = {}
    parameterSaveValueCache = {}
    parameterUnits = {}
    get parameters() {
        return [...this.parameterValueElements.children].map(x => x.name)
    }
    set parameters(parameters) {
        for(let i in parameters){ 
            if(parameters[i] === ``) {
                parameters.splice(i, 1)
            }
        }
        while(parameters.length < this.parameterValueElements.children.length) { this.parameterValueElements.removeChild(this.parameterValueElements.lastChild) }
        while(parameters.length < this.parameterElements.children.length) { this.parameterElements.removeChild(this.parameterElements.lastChild) }
        for(let i = 0; i < parameters.length; i++) { 
            let parameterValue = this.parameterValues[parameters[i]]
            if(!parameterValue) {
                parameterValue = this.parameterValues[parameters[i]] = new CalculationOrVariableSelection({
                    label: parameters[i],
                    calculations: this.calculations,
                    outputTypes: [ `bool|float` ],
                    displayUnits: this.outputUnits
                })
                parameterValue.style.display = `inline`
            }
            let parameterUnit = this.parameterUnits[parameters[i]]
            if(!parameterUnit) {
                parameterUnit = this.parameterUnits[parameters[i]] = new UIUnit({
                    value: this.outputUnits?.[0]
                })
                parameterUnit.addEventListener(`change`, () => {
                    const subConfig = parameterValue.SubConfig
                    if(subConfig)
                        subConfig.displayUnits = subConfig.outputUnits = [ parameterUnit.value ]
                })
                parameterValue.selection.addEventListener(`change`, () => {
                    const subConfig = parameterValue.SubConfig
                    if(subConfig) {
                        subConfig.outputUnits = [ parameterUnit.value ?? this.outputUnits?.[0] ]
                    }
                })
                parameterValue.addEventListener(`change`, () => {
                    const subConfig = parameterValue.SubConfig
                    if(subConfig) {
                        if(subConfig.outputUnits?.[0] != undefined)
                            parameterUnit.value = subConfig.outputUnits?.[0]
                        parameterUnit.hidden = false
                    } else {
                        parameterUnit.hidden = true
                    }
                })
                if(!parameterValue.SubConfig)
                    parameterUnit.hidden = true
            }
            let formulaParameter = this.parameterElements.children[i]
            if(!formulaParameter) {
                formulaParameter = this.parameterElements.appendChild(document.createElement(`div`))
            }
            formulaParameter.replaceChildren(parameterValue)
            formulaParameter.appendChild(parameterUnit)
            let configParameter = this.parameterValueElements.children[i]
            if(!configParameter) {
                configParameter = this.parameterValueElements.appendChild(document.createElement(`span`))
                configParameter.style.display = "block"
                let label = configParameter.appendChild(document.createElement(`label`))
                label.append(document.createElement(`span`))
                Object.defineProperty(configParameter, `name`, {
                    get: function() {
                        return this._name
                    },
                    set: function(name) {
                        this._name = name
                        this.firstChild.firstChild.innerText = name
                    }
                })
                label.append(`:`)
                configParameter.append(document.createElement(`span`))
            }
            configParameter.name = parameters[i]
            configParameter.lastChild.replaceChildren(parameterValue.liveUpdate, parameterValue.calculationContent)
            if(parameterValue.calculationContent.innerHTML === ``)
                configParameter.hidden = true
            else
                configParameter.hidden = false
            parameterValue.selection.addEventListener(`change`, () => {
                if(parameterValue.calculationContent.innerHTML === ``)
                    configParameter.hidden = true
                else
                    configParameter.hidden = false
                if([...this.parameterValueElements.children].filter(x => !x.hidden).length === 0) {
                    this.parameterValueElements.classList.remove(`configContainer`)
                    this.parameterValueElementshidden = true
                } else {
                    this.parameterValueElements.classList.add(`configContainer`)
                    this.parameterValueElements.hidden = false
                }
            })
        }
        if([...this.parameterValueElements.children].filter(x => !x.hidden).length === 0) {
            this.parameterValueElements.classList.remove(`configContainer`)
            this.parameterValueElementshidden = true
        } else {
            this.parameterValueElements.classList.add(`configContainer`)
            this.parameterValueElements.hidden = false
        }
    }

    get label() {
        return this.labelElement.textContent
    }
    set label(label){
        this.labelElement.textContent = label
        this.editFormula.title = label + ` Formula`
    }

    get value() {
        let value = super.value
        
        value.parameterValues = {}
        let parameters = this.parameters
        for(let parameterIndex in parameters) {
            value.parameterValues[parameters[parameterIndex]] = this.parameterValues[parameters[parameterIndex]]?.value
        }

        return value
    }
    set value(value) {
        value ??= {}
        super.value = value
        
        Object.keys(this.parameterValues).filter(p => value.parameterValues[p] == undefined).forEach(p => { delete this.parameterValues[p] })

        for(let parameter in value.parameterValues) {
            let parameterValue = this.parameterValues[parameter] ??= new CalculationOrVariableSelection({
                label: parameter,
                calculations: this.calculations,
                outputTypes: [ `bool|float` ],
                displayUnits: this.outputUnits
            })
            parameterValue.style.display = `inline`

            parameterValue.value = value.parameterValues[parameter]
            if(this.parameterUnits[parameter])
                this.parameterUnits[parameter].value = value.parameterValues[parameter].outputUnits?.[0]
            else if(saveValue.parameterUnits?.[parameter] && parameterValue.SubConfig)
                parameterValue.SubConfig.outputUnits = value.parameterValues[parameter].outputUnits
            parameterValue.value = value.parameterValues[parameter]
        }
    }

    get saveValue() {
        let saveValue = super.saveValue ?? {}
        
        saveValue.parameterValues = {}
        saveValue.parameterUnits = {}
        for(let parameter in this.parameterValues) {
            saveValue.parameterValues[parameter] = this.parameterValues[parameter]?.saveValue
            saveValue.parameterUnits[parameter] = this.parameterUnits[parameter]?.value
        }

        return saveValue
    }
    set saveValue(saveValue) {
        saveValue ??= {}
        super.saveValue = saveValue
    
        Object.keys(this.parameterValues).filter(p => saveValue.parameterValues[p] == undefined).forEach(p => { delete this.parameterValues[p] })

        for(let parameter in saveValue.parameterValues) {
            let parameterValue = this.parameterValues[parameter] ??= new CalculationOrVariableSelection({
                label: parameter,
                calculations: this.calculations,
                outputTypes: [ `bool|float` ],
                displayUnits: this.outputUnits,
            })
            parameterValue.style.display = `inline`

            parameterValue.saveValue = saveValue.parameterValues[parameter]
            if(saveValue.parameterUnits?.[parameter] != undefined) {
                if(this.parameterUnits[parameter])
                    this.parameterUnits[parameter].value = saveValue.parameterUnits[parameter]
                else if(parameterValue.SubConfig)
                    parameterValue.SubConfig.outputUnits = [ saveValue.parameterUnits[parameter] ]
            }
            parameterValue.saveValue = saveValue.parameterValues[parameter]
        }
    }

    constructor(prop) {
        super()
        this.parameterElements.class = `configContainer`
        this.parameterElements.style.display = `block`
        this.parameterElements.style.minHeight = `200px`
        this.parameterValueElements.hidden = true
        this.formula.addEventListener(`change`, () => {
            let operators = [`!`,`*`,`/`,`+`,`-`,`>=`,`<=`,`>`,`<`,`=`,`&`,`|`]
            let parameters = this.formula.value.replaceAll(` `, ``)
            for(let operatorIndex in operators) {
                let operator = operators[operatorIndex]
                parameters = parameters.split(operator).join(`,`)
            }
            let parameterSplit = parameters.split(`,`)
            let operatorSplit = this.formula.value.replaceAll(` `, ``)
            for(let i = 0; i < parameterSplit.length; i++) {
                let loc = operatorSplit.indexOf(parameterSplit[i])
                operatorSplit = operatorSplit.substring(0, loc) + `,` + operatorSplit.substring(loc + parameterSplit[i].length)
            }
            operatorSplit = operatorSplit.split(`,`)
            //allow parenthesis in parameter names
            parameters = ``
            for(let i = 0; i < parameterSplit.length; i++) {
                if(parameters !== ``) parameters += `,`
                parameters += parameterSplit[i]

                if(parameterSplit[i].match(/[^,][(]/) && parameterSplit[i][parameterSplit[i].length - 1] !== `)`) {
                    while(++i < parameterSplit.length) {
                        parameters += operatorSplit[i] + parameterSplit[i]
                        if(parameterSplit[i][parameterSplit[i].length - 1] === `)`) break
                    }
                }
            }
            parameters = parameters.split(`,`)
            //remove parenthesis operator from parameters
            parameters = parameters.map(s => s[0] === `(` ? s.substring(1) : s)
            parameters = parameters.map(s => {
                while(s[s.length-1] === `)` && s.split(`)`).length > s.split(`(`).length)
                    s = s.substring(0, s.length-1)
                return s
            })
            //filter out static values
            parameters = parameters.filter(s => !s.match(/^[0-9]*$/))
            //filter out null parameters
            parameters = parameters.filter(s => s.length !== 0)
            //filter out self
            parameters = parameters.filter(s => s !== `self`)
            this.parameters = parameters
        })
        this.Setup(prop)
    }
    
    Setup(prop) {
        super.Setup(prop)
        this.editFormula.content.innerHTML = ``
        this.editFormula.content.append(this.querySelector(`[data-element="editFormulaContent"]`))
    }

    RegisterVariables(reference) {
        reference = { ...reference }
        if (reference) {
            reference.unit = this.outputUnits?.[0] ?? reference.unit
            if(reference.unit) {
                delete reference.type
            } else {
                delete reference.unit
                reference.type = this.outputTypes?.[0] ?? reference.type
            }

            let operators = [`*`,`/`,`+`,`-`,`>=`,`<=`,`>`,`<`,`=`,`&`,`|`]
            if(!operators.some(o => this.formula.value.indexOf(o) > -1)) {
                this.parameterValues[this.parameters[0]]?.RegisterVariables(reference)
            } else {
                this.parameters.forEach(parameter => { this.parameterValues[parameter]?.RegisterVariables({ name: `${reference.name}_${this.parameterValues[parameter].label}`, unit: this.parameterValues[parameter].unit}) })
                VariableRegister.RegisterVariable(reference)
            }
        }
    }
}
customElements.define(`calculation-formula`, Calculation_Formula, { extends: `span` })
GenericConfigs.push(Calculation_Formula)