
import UITemplate from "../JavascriptUI/UITemplate.js";
import UIDialog from "../JavascriptUI/UIDialog.js";
import UIText from "../JavascriptUI/UIText.js";
export default class Calculation_Formula extends UITemplate {
    static displayName = `Formula`;
    static Output = `float`;
    static Inputs = [];
    static Template = `<div data-element="editFormula"></div><div data-element="parameterElements"></div>`;

    editFormula = new UIDialog({ buttonLabel: `Edit Formula` });
    formulaDialogTemplate = new UITemplate({ 
        Template: `<div style="display: flex; width: 100%"><div style="margin-right: 2em; width: fit-content">Formula:</div><div data-element="formula"></div></div><div data-element="parameterElements"></div>`, 
        parameterElements: document.createElement(`div`),
        formula: new UIText({ class: `formula` })
    });
    parameterElements = document.createElement(`div`);
    #operations = [];
    get operations() {
        return this.#operations;
    }
    set operations(operations) {
        this.#operations = operations;
        const thisClass = this;
        this.parameters = operations.flatMap(o => o.parameters).filter(p => p.indexOf(`temp`) !== 0 && isNaN(parseFloat(p))).sort(function(a,b) { return thisClass.formulaDialogTemplate.formula.value.indexOf(a) - thisClass.formulaDialogTemplate.formula.value.indexOf(b); });
    }

    parameterValues = {};
    get parameters() {
        return [...this.parameterElements.children].map(e => e.name);
    }
    set parameters(parameters) {
        const thisClass = this;
        for(let i in parameters){ 
            if(parameters[i] === ``) {
                parameters.splice(i, 1);
            }
        }
        while(parameters.length < this.parameterElements.children.length) { this.parameterElements.removeChild(this.parameterElements.lastChild); }
        while(parameters.length < this.formulaDialogTemplate.parameterElements.children.length) { this.formulaDialogTemplate.parameterElements.removeChild(this.formulaDialogTemplate.parameterElements.lastChild); }
        for(let i = 0; i < parameters.length; i++) { 
            let parameterValue = this.parameterValues[parameters[i]];
            if(!parameterValue) {
                parameterValue = this.parameterValues[parameters[i]] = new CalculationOrVariableSelection({
                    label: parameters[i],
                    calculations: GenericConfigs,
                    output: `float`,
                    ReferenceName: this.ReferenceName? `${this.ReferenceName}_${parameters[i]}` : undefined,
                    measurementName: this.measurementName
                });
            }
            let formulaParameter = this.formulaDialogTemplate.parameterElements.children[i];
            if(!formulaParameter) {
                formulaParameter = this.formulaDialogTemplate.parameterElements.appendChild(document.createElement(`div`)); 
            }
            formulaParameter.replaceChildren(parameterValue);
            let configParameter = this.parameterElements.children[i];
            if(!configParameter) {
                configParameter = this.parameterElements.appendChild(document.createElement(`span`));
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
            configParameter.lastChild.replaceChildren(parameterValue.LiveUpdate, parameterValue.CalculationContent);
            if(parameterValue.CalculationContent.innerHTML === ``)
                configParameter.hidden = true;
            else
                configParameter.hidden = false;
            parameterValue.selection.addEventListener(`change`, function() {
                if(parameterValue.CalculationContent.innerHTML === ``)
                    configParameter.hidden = true;
                else
                    configParameter.hidden = false;
                if([...thisClass.parameterElements.children].filter(e => !e.hidden).length === 0)
                    thisClass.parameterElements.hidden = true;
                else 
                    thisClass.parameterElements.hidden = false;
            });
        }
        if([...this.parameterElements.children].filter(e => !e.hidden).length === 0)
            this.parameterElements.hidden = true;
        else 
            this.parameterElements.hidden = false;
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
        for(let parameter in this.parameterValues) {
            let parameterValue = this.parameterValues[parameter];
            if(!parameterValue)
                continue;
            
            this.parameterValues.measurementName = measurementName;
        }
    }
    
    _referenceName = undefined;
    get ReferenceName() {
        return this._referenceName;
    }
    set ReferenceName(referenceName) {
        if(this._referenceName === referenceName)
            return;

        this._referenceName = referenceName;
        for(let parameter in this.parameterValues) {
            let parameterValue = this.parameterValues[parameter];
            if(!parameterValue)
                continue;

            parameterValue.ReferenceName = this.ReferenceName? `${this.ReferenceName}_${parameters[i]}` : undefined;
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
                calculations: GenericConfigs,
                output: `float`,
                ReferenceName: this.ReferenceName? `${this.ReferenceName}_${parameter}` : undefined,
                measurementName: this.measurementName
            });

            parameterValue.saveValue = saveValue.parameterValues[parameter];

            window[parameter] = parameterValue.calculationValues[0];
        }
    }

    get value() {
        let value = super.value ?? {};
        
        value.parameterValues = {};
        for(parameter in this.parameterValues) {
            value.parameterValues[parameter] = this.parameterValues[parameter]?.value;
        }

        return value;
    }

    set value(value) {
        value ??= {};
        super.value = value;
        
        const thisClass = this;
        Object.keys(this.parameterValues).filter(p => value.parameterValues[p] === undefined).forEach(function(p) { delete thisClass.parameterValues[p]; })

        for(let parameter in value.parameterValues) {
            let parameterValue = this.parameterValues[parameter] ??= new CalculationOrVariableSelection({
                label: parameter,
                calculations: GenericConfigs,
                output: `float`,
                ReferenceName: this.ReferenceName? `${this.ReferenceName}_${parameter}` : undefined,
                measurementName: this.measurementName
            });

            parameterValue.value = value.parameterValues[parameter];
        }
    }

    constructor(prop) {
        super();
        const thisClass = this;
        this.editFormula.content.append(this.formulaDialogTemplate);
        this.editFormula.content.style.minHeight = `200px`;
        this.formulaDialogTemplate.parameterElements.class = `configContainer`;
        this.formulaDialogTemplate.formula.addEventListener(`change`, function() {
            const operations = Calculation_Formula.ParseFormula(thisClass.formulaDialogTemplate.formula.value); 
            if(!Array.isArray(operations)) {
                return; //show something to user
            }
            thisClass.operations = operations;
        });
        this.formulaDialogTemplate.parameterElements.style.display = `block`;
        this.parameterElements.class = `configContainer`;
        this.Setup(prop)
    }

    RegisterVariables() {
        const thisClass = this;
        this.parameters.forEach(function(parameter) { thisClass.parameterValues[parameter].RegisterVariables(); })
        if (this.ReferenceName) {
            const thisReference = this.GetVariableReference();
            const type = GetClassProperty(this, `Output`);
            VariableRegister.RegisterVariable(thisReference, GetClassProperty(this, `Output`));
        }
    }

    GetVariableReference() {
        return `${this.ReferenceName}${this.measurementName? `(${this.measurementName})` : ``}`;
    }

    GetObjOperation(outputVariableId) {
        var group  = { 
            type: `Group`, 
            value: []
        };
        outputVariableId ?? this.ReferenceName;
        
        const thisClass = this;
        this.parameters.forEach(function(parameter) { group.value.push(thisClass.parameterValues[parameter].GetObjOperation()); })
        const operations = this.operations;
        for(let operationIndex in operations) {
            let operation = operations[operationIndex];
            if(operation.resultInto === `return`)
                operation.resultInto = outputVariableId ?? this.GetVariableReference();
            let parameterValues = operation.parameters.map(p => thisClass.parameterValues[p]?.GetVariableReference() ?? p);
            switch(operation.operator) {
                case `*`: 
                group.value.push({ 
                    type: `Operation_Multiply`,
                    result: operation.resultInto, //Return
                    a: parameterValues[0],
                    b: parameterValues[1]
                });
                break;
                case `/`: 
                group.value.push({ 
                    type: `Operation_Divide`,
                    result: operation.resultInto, //Return
                    a: parameterValues[0],
                    b: parameterValues[1]
                });
                break;
                case `+`: 
                group.value.push({ 
                    type: `Operation_Add`,
                    result: operation.resultInto, //Return
                    a: parameterValues[0],
                    b: parameterValues[1]
                });
                break;
                case `-`: 
                group.value.push({ 
                    type: `Operation_Subtract`,
                    result: operation.resultInto, //Return
                    a: parameterValues[0],
                    b: parameterValues[1]
                });
                break;
            }
        }

        console.log(group);
        
        return group;
    }
    static ParseFormula(formula, operators = [`*`,`/`,`+`,`-`]) {
        formula = formula.replaceAll(` `, ``); 
        let operations = [];
        let tempIndex = 0;

        //do parenthesis
        let parenthesisFormulas = formula.split(`)`)
        if(parenthesisFormulas.length !== formula.split(`(`).length)
            return `Parenthesis start and end not matching`

        while((parenthesisFormulas = formula.split(`)`)).length > 1) {
            tempIndex++;
            let tempFormula = parenthesisFormulas[0].split(`(`).pop();
            operations.push({
                resultInto: `$temp${tempIndex}`,
                parameters: [tempFormula]
            })
            formula = formula.replace(`(${tempFormula})`, `$temp${tempIndex}`);
        }
        operations.push({
            resultInto: `return`,
            parameters: [formula]
        })

        //do operators
        function splitOnOperators(s) {
            for(let operatorIndex in operators) {
                let operator = operators[operatorIndex];
                s = s.split(operator).join(`,`);
            }
            return s.split(`,`);
        }

        for(let operatorIndex in operators) {
            let operator = operators[operatorIndex];
            let operationIndex;
            while((operationIndex = operations.findIndex(f => f.parameters.find(p => p.indexOf(operator) > -1))) > -1) {
                let formula = operations[operationIndex];
                let parameterIndex = formula.parameters.findIndex(p => p.indexOf(operator) > -1);
                let parameter = formula.parameters[parameterIndex];
                let firstParameter = splitOnOperators(parameter.split(operator)[0]).pop();
                let secondParameter = splitOnOperators(parameter.split(operator)[1])[0];
                if(formula.parameters.length > 1 || splitOnOperators(formula.parameters[0].replace(`${firstParameter}${operator}${secondParameter}`, `temp`)).length > 1) {
                    tempIndex++;
                    formula.parameters[parameterIndex] = parameter.replace(`${firstParameter}${operator}${secondParameter}`, `$temp${tempIndex}`);
                    operations.splice(operationIndex, 0, {
                        operator,
                        resultInto: `$temp${tempIndex}`,
                        parameters: [firstParameter, secondParameter]
                    });
                } else {
                    operations[operationIndex].operator = operator;
                    operations[operationIndex].parameters = [firstParameter, secondParameter];
                }
            }
        }

        //consolidate temp variables
        tempIndex = 0;
        for(let operationIndex in operations) {
            operationIndex = parseInt(operationIndex);
            let formula = operations[operationIndex];
            if(formula.resultInto.indexOf(`$temp`) !== 0)
                continue;
            let nextFormulaParameterIndex;
            if  (operations.filter(f => f.parameters.findIndex(p => p === formula.resultInto) > -1).length < 2 && 
                (nextFormulaParameterIndex = operations[operationIndex+1]?.parameters?.findIndex(p => p === formula.resultInto)) > -1) {
                    operations[operationIndex+1].parameters[nextFormulaParameterIndex] = formula.resultInto = `temp`;
            } else {
                tempIndex++;
                operations.filter(f => f.parameters.findIndex(p => p === formula.resultInto) > -1).forEach(function(f) { for(let parameterIndex in f.parameters) {
                    if(f.parameters[parameterIndex] === formula.resultInto) 
                        f.parameters[parameterIndex] = `temp${tempIndex}`;
                } })
                formula.resultInto = `temp${tempIndex}`;
            }
        }

        return operations;
    }
}
customElements.define(`calculation-formula`, Calculation_Formula, { extends: `span` })
GenericConfigs.push(Calculation_Formula);