
import UITemplate from "../JavascriptUI/UITemplate.js"
import UIDialog from "../JavascriptUI/UIDialog.js"
import UIText from "../JavascriptUI/UIText.js"
import UIUnit from "../UI/UIUnit.js"
export default class Calculation_Formula extends UITemplate {
    static displayName = `Formula`
    static outputTypes = [ `bool|float` ]
    static template = `<div data-element="editFormula"></div><div data-element="editFormulaContent"><div style="display: flex; width: 100%"><div style="margin-right: 2em; width: fit-content">Formula:</div><div data-element="formula"></div></div><div data-element="parameterElements"></div></div><div data-element="parameterValueElements"></div>`

    editFormula = new UIDialog({ buttonLabel: `Edit Formula` })
    formula = new UIText({ class: `formula` })
    parameterElements = document.createElement(`div`)
    parameterValueElements = document.createElement(`div`)

    parameterValues = {}
    parameterUnits = {}
    get parameters() {
        return [...this.parameterValueElements.children].map(e => e.name)
    }
    set parameters(parameters) {
        const thisClass = this
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
                parameterUnit.addEventListener(`change`, e => {
                    const subConfig = parameterValue.SubConfig
                    if(subConfig)
                        subConfig.displayUnits = [ parameterUnit.value ]
                })
                parameterValue.addEventListener(`change`, e => {
                    const subConfig = parameterValue.SubConfig
                    if(subConfig) {
                        parameterUnit.value = subConfig.displayUnits?.[0]
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
            parameterValue.selection.addEventListener(`change`, function() {
                if(parameterValue.calculationContent.innerHTML === ``)
                    configParameter.hidden = true
                else
                    configParameter.hidden = false
                if([...thisClass.parameterValueElements.children].filter(e => !e.hidden).length === 0)
                    thisClass.parameterValueElements.hidden = true
                else 
                    thisClass.parameterValueElements.hidden = false
            })
        }
        if([...this.parameterValueElements.children].filter(e => !e.hidden).length === 0)
            this.parameterValueElements.hidden = true
        else 
            this.parameterValueElements.hidden = false
    }

    get label() {
        return this.editFormula.title.substring(0, this.editFormula.title.length - 8)
    }
    set label(label){
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
        
        const thisClass = this
        Object.keys(this.parameterValues).filter(p => value.parameterValues[p] == undefined).forEach(function(p) { delete thisClass.parameterValues[p] })

        for(let parameter in value.parameterValues) {
            let parameterValue = this.parameterValues[parameter] ??= new CalculationOrVariableSelection({
                label: parameter,
                calculations: this.calculations,
                outputTypes: [ `bool|float` ],
                displayUnits: this.outputUnits
            })
            parameterValue.style.display = `inline`

            parameterValue.value = value.parameterValues[parameter]
        }
    }

    get saveValue() {
        let saveValue = super.saveValue ?? {}
        
        saveValue.parameterValues = {}
        for(let parameter in this.parameterValues) {
            saveValue.parameterValues[parameter] = this.parameterValues[parameter]?.saveValue
        }

        return saveValue
    }
    set saveValue(saveValue) {
        saveValue ??= {}
        super.saveValue = saveValue
    
        const thisClass = this
        Object.keys(this.parameterValues).filter(p => saveValue.parameterValues[p] == undefined).forEach(function(p) { delete thisClass.parameterValues[p] })

        for(let parameter in saveValue.parameterValues) {
            let parameterValue = this.parameterValues[parameter] ??= new CalculationOrVariableSelection({
                label: parameter,
                calculations: this.calculations,
                outputTypes: [ `bool|float` ],
                displayUnits: this.outputUnits
            })
            parameterValue.style.display = `inline`

            parameterValue.saveValue = saveValue.parameterValues[parameter]
        }
    }

    constructor(prop) {
        super()
        let thisClass = this
        this.parameterElements.class = `configContainer`
        this.parameterElements.style.display = `block`
        this.parameterElements.style.minHeight = `200px`
        this.parameterValueElements.class = `configContainer`
        this.parameterValueElements.hidden = true
        this.formula.addEventListener(`change`, function() {
            let operators = [`*`,`/`,`+`,`-`,`>=`,`<=`,`>`,`<`,`=`,`&`,`|`]
            let parameters = thisClass.formula.value.replaceAll(` `, ``)
            for(let operatorIndex in operators) {
                let operator = operators[operatorIndex]
                parameters = parameters.split(operator).join(`,`)
            }
            let parameterSplit = parameters.split(`,`)
            let operatorSplit = thisClass.formula.value.replaceAll(` `, ``)
            for(let i = 0; i < parameterSplit.length; i++) {
                let loc = operatorSplit.indexOf(parameterSplit[i])
                operatorSplit = operatorSplit.substring(0, loc) + `,` + operatorSplit.substring(loc + parameterSplit[i].length)
            }
            operatorSplit = operatorSplit.split(`,`)
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
            parameters = parameters.split(`,`).filter(s => !s.match(/^[0-9]*$/))
            parameters = parameters.map(s => s[0] === `(` ? s.substring(1) : s)
            parameters = parameters.map(s => s[s.length-1] === `)` && s.split(`)`).length > s.split(`(`).length? s.substring(0, s.length-1) : s)
            parameters = parameters.filter(s => s.length !== 0)
            thisClass.parameters = parameters
        })
        this.Setup(prop)
    }
    
    Setup(prop) {
        super.Setup(prop)
        this.editFormula.content.append(this.querySelector(`[data-element="editFormulaContent"]`))
    }

    RegisterVariables(reference) {
        reference = { ...reference }
        const thisClass = this
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
                this.parameters.forEach(function(parameter) { thisClass.parameterValues[parameter]?.RegisterVariables({ name: `${reference.name}_${thisClass.parameterValues[parameter].label}`, unit: thisClass.parameterValues[parameter].unit}) })
                VariableRegister.RegisterVariable(reference)
            }
        }
    }
}
customElements.define(`calculation-formula`, Calculation_Formula, { extends: `span` })
GenericConfigs.push(Calculation_Formula)