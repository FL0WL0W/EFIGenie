
import UITemplate from "../JavascriptUI/UITemplate.js"
import UIDialog from "../JavascriptUI/UIDialog.js"
import UIText from "../JavascriptUI/UIText.js"
export default class Calculation_Formula extends UITemplate {
    static displayName = `Formula`
    static output = `bool|float`
    static inputs = []
    static template = `<div data-element="editFormula"></div><div data-element="editFormulaContent"><div style="display: flex; width: 100%"><div style="margin-right: 2em; width: fit-content">Formula:</div><div data-element="formula"></div></div><div data-element="parameterElements"></div></div><div data-element="parameterValueElements"></div>`

    editFormula = new UIDialog({ buttonLabel: `Edit Formula` })
    formula = new UIText({ class: `formula` })
    parameterElements = document.createElement(`div`);
    parameterValueElements = document.createElement(`div`);

    parameterValues = {};
    get parameters() {
        return [...this.parameterValueElements.children].map(e => e.name);
    }
    set parameters(parameters) {
        const thisClass = this;
        for(let i in parameters){ 
            if(parameters[i] === ``) {
                parameters.splice(i, 1);
            }
        }
        while(parameters.length < this.parameterValueElements.children.length) { this.parameterValueElements.removeChild(this.parameterValueElements.lastChild); }
        while(parameters.length < this.parameterElements.children.length) { this.parameterElements.removeChild(this.parameterElements.lastChild); }
        for(let i = 0; i < parameters.length; i++) { 
            let parameterValue = this.parameterValues[parameters[i]];
            if(!parameterValue) {
                parameterValue = this.parameterValues[parameters[i]] = new CalculationOrVariableSelection({
                    label: parameters[i],
                    calculations: this.calculations,
                    output: `bool|float`,
                    limitSelectionsOnMeasurement: false
                });
            }
            let formulaParameter = this.parameterElements.children[i];
            if(!formulaParameter) {
                formulaParameter = this.parameterElements.appendChild(document.createElement(`div`)); 
            }
            formulaParameter.replaceChildren(parameterValue);
            let configParameter = this.parameterValueElements.children[i];
            if(!configParameter) {
                configParameter = this.parameterValueElements.appendChild(document.createElement(`span`));
                configParameter.style.display = "block"; 
                let label = configParameter.appendChild(document.createElement(`label`));
                label.append(document.createElement(`span`));
                Object.defineProperty(configParameter, `name`, {
                    get: function() {
                        return this.firstChild.firstChild.innerText;
                    },
                    set: function(name) {
                        this.firstChild.firstChild.innerText = name;
                    }
                });
                label.append(`:`);
                configParameter.append(document.createElement(`span`));
            }
            configParameter.name = parameters[i];
            configParameter.lastChild.replaceChildren(parameterValue.liveUpdate, parameterValue.calculationContent);
            if(parameterValue.calculationContent.innerHTML === ``)
                configParameter.hidden = true;
            else
                configParameter.hidden = false;
            parameterValue.selection.addEventListener(`change`, function() {
                if(parameterValue.calculationContent.innerHTML === ``)
                    configParameter.hidden = true;
                else
                    configParameter.hidden = false;
                if([...thisClass.parameterValueElements.children].filter(e => !e.hidden).length === 0)
                    thisClass.parameterValueElements.hidden = true;
                else 
                    thisClass.parameterValueElements.hidden = false;
            });
        }
        if([...this.parameterValueElements.children].filter(e => !e.hidden).length === 0)
            this.parameterValueElements.hidden = true;
        else 
            this.parameterValueElements.hidden = false;
    }

    get label() {
        return this.editFormula.title.substring(0, this.editFormula.title.length - 8)
    }
    set label(label){
        this.editFormula.title = label + ` Formula`;
    }

    _measurementName = undefined;
    get measurementName() {
        if(this._measurementName)
            return this._measurementName;
    }
    set measurementName(measurementName) {
        if(this._measurementName === measurementName)
            return;

        this._measurementName = measurementName;
    }

    get value() {
        let value = super.value
        
        value.parameterValues = {}
        let parameters = this.parameters
        for(let parameterIndex in parameters) {
            value.parameterValues[parameters[parameterIndex]] = this.parameterValues[parameters[parameterIndex]]?.value;
        }

        return value
    }
    set value(value) {
        value ??= {};
        super.value = value;
        
        const thisClass = this;
        Object.keys(this.parameterValues).filter(p => value.parameterValues[p] === undefined).forEach(function(p) { delete thisClass.parameterValues[p]; })

        for(let parameter in value.parameterValues) {
            let parameterValue = this.parameterValues[parameter] ??= new CalculationOrVariableSelection({
                label: parameter,
                calculations: this.calculations,
                output: `bool|float`,
                limitSelectionsOnMeasurement: false
            });

            parameterValue.value = value.parameterValues[parameter];
        }
    }

    get saveValue() {
        let saveValue = super.saveValue ?? {};
        
        saveValue.parameterValues = {};
        for(let parameter in this.parameterValues) {
            saveValue.parameterValues[parameter] = this.parameterValues[parameter]?.saveValue;
        }

        return saveValue;
    }
    set saveValue(saveValue) {
        saveValue ??= {};
        super.saveValue = saveValue;
        
        const thisClass = this;
        Object.keys(this.parameterValues).filter(p => saveValue.parameterValues[p] === undefined).forEach(function(p) { delete thisClass.parameterValues[p]; })

        for(let parameter in saveValue.parameterValues) {
            let parameterValue = this.parameterValues[parameter] ??= new CalculationOrVariableSelection({
                label: parameter,
                calculations: this.calculations,
                output: `bool|float`,
                limitSelectionsOnMeasurement: false
            });

            parameterValue.saveValue = saveValue.parameterValues[parameter];
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
            let s = thisClass.formula.value.replaceAll(` `, ``)
            for(let operatorIndex in operators) {
                let operator = operators[operatorIndex]
                s = s.split(operator).join(`,`)
            }
            s = s.split(`,`).filter(x => !x.match(/^[0-9]*$/))
            thisClass.parameters = s
        })
        this.output = MeasurementType[prop.measurementName] ?? `float`
        this.Setup(prop)
        this.editFormula.content.append(this.querySelector(`[data-element="editFormulaContent"]`))
    }

    RegisterVariables(referenceName) {
        const thisClass = this;
        if (referenceName) {
            if(this.parameters.length === 1) {
                this.parameterValues[this.parameters[0]].RegisterVariables(referenceName)
            } else {
                this.parameters.forEach(function(parameter) { thisClass.parameterValues[parameter].RegisterVariables(`${referenceName}_${parameter}`); })
                const type = GetClassProperty(this, `output`);
                VariableRegister.RegisterVariable(`${referenceName}${this.measurementName? `(${this.measurementName})` : ``}`, type);
            }
        }
    }
}
customElements.define(`calculation-formula`, Calculation_Formula, { extends: `span` })
GenericConfigs.push(Calculation_Formula);