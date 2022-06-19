import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
import UINumber from "../JavascriptUI/UINumber.js";
//this still needs some complicated unit work. this is ok for now
export default class Calculation_Polynomial extends HTMLSpanElement {
    static displayName = `Polynomial`;
    static output = `float`;
    static inputs = [`float`];

    get measurementName() {
        return this.#coeffecientElement.firstChild.measurementName;
    }
    set measurementName(measurement) {
        this.#coeffecientElement.firstChild.measurementName = measurement;
    }

    get measurementUnitName() {
        return this.#coeffecientElement.firstChild.measurementUnitName;
    }
    set measurementUnitName(measurementUnitName) {
        this.#coeffecientElement.firstChild.measurementUnitName = measurementUnitName;
    }

    #coeffecientElement = document.createElement(`div`);
    get coeffecients() {
        const thisClass = this;
        return [...this.#coeffecientElement.children].map(function(element, index) { return thisClass.#toBaseValue(element.value, index); });
    }
    set coeffecients(value) {
        this.degree = value.length;
        for(let i = 0; i < this.#coeffecientElement.children.length; i++) {
            this.#coeffecientElement.children[i].value = this.#toDisplayValue(value[i], i);
        }
    }
    
    #minValueElement = new UINumberWithMeasurement({
        value: 0
    });
    get minValue() {
        return this.#minValueElement.value;
    }
    set minValue(minValue) {
        this.#minValueElement.value = minValue;
    }
    
    #maxValueElement = new UINumberWithMeasurement({
        value: 1
    });
    get maxValue() {
        return this.#maxValueElement.value;
    }
    set maxValue(maxValue) {
        this.#maxValueElement.value = maxValue;
    }

    #degreeElement = new UINumber({
        min: 2,
        max: 100,
        step: 1,
        value: 0
    });
    get degree() {
        return this.#degreeElement.value;
    }
    set degree(degree) {
        this.#degreeElement.value = degree;
    }

    constructor(prop) {
        super();
        const minValueLabel = document.createElement(`label`);
        minValueLabel.textContent = `Minimum Value:`
        this.append(minValueLabel);
        this.#minValueElement.displayMeasurement.hidden = true;
        this.append(this.#minValueElement);
        this.append(document.createElement(`br`));
        const maxValueLabel = document.createElement(`label`);
        this.append(maxValueLabel);
        this.#maxValueElement.displayMeasurement.hidden = true;
        maxValueLabel.textContent = `Maximum Value:`
        this.append(this.#maxValueElement);
        this.append(document.createElement(`br`));
        const degreeLabel = document.createElement(`label`);
        degreeLabel.textContent = `Degree:`
        this.append(degreeLabel);
        this.append(this.#degreeElement);
        this.append(document.createElement(`br`));
        const thisClass = this;
        this.#degreeElement.addEventListener(`change`, function() {
            while(thisClass.#coeffecientElement.children.length > thisClass.degree) { thisClass.#coeffecientElement.removeChild(thisClass.#coeffecientElement.lastChild); }
            for(let i = thisClass.#coeffecientElement.children.length; i < thisClass.degree; i++) {
                let coeffecientElement = thisClass.#coeffecientElement.appendChild(document.createElement(`div`));
                let number = coeffecientElement.appendChild(i === 0? new UINumberWithMeasurement({ value: 0 }) : new UINumber({ value: 0 }));
                if(i !== 0) {
                    let label = coeffecientElement.appendChild(document.createElement(`span`));
                    label.innerHTML = `x<sup>${i}</sup> +`;
                } else {

                    number.addEventListener(`change`, function() { coeffecientElement.dispatchEvent(new Event(`change`, {bubbles: true})); });
                }
                coeffecientElement.style.display = `inline`;
                Object.defineProperty(coeffecientElement, 'value', {
                    get: function() { return this.firstChild.value; },
                    set: function(value) { this.firstChild.value = value }
                });
                Object.defineProperty(coeffecientElement, 'measurementName', {
                    get: function() { return this.firstChild.measurementName; },
                    set: function(value) { this.firstChild.measurementName = value }
                });
                Object.defineProperty(coeffecientElement, 'measurementUnitName', {
                    get: function() { return this.firstChild.measurementUnitName; },
                    set: function(value) { this.firstChild.measurementUnitName = value }
                });
            }
        });
        this.degree = 2;
        this.append(this.#coeffecientElement);
        this.#coeffecientElement.style.display = `flex`;
        this.#coeffecientElement.style.flexDirection = `row-reverse`;
        this.#coeffecientElement.style.alignItems = `flex-start`;
        this.#coeffecientElement.style.justifyContent = `flex-end`;
        this.#coeffecientElement.firstChild.addEventListener(`change`, function() {
            //convert value
            thisClass.#minValueElement.measurementName = thisClass.measurementName;
            thisClass.#maxValueElement.measurementName = thisClass.measurementName;
            thisClass.#minValueElement.measurementUnitName = thisClass.measurementUnitName;
            thisClass.#maxValueElement.measurementUnitName = thisClass.measurementUnitName;
        });
        Object.assign(this, prop);
    }

    get value() {
        return { 
            minValue: this.minValue,
            maxValue: this.maxValue,
            coeffecients: this.coeffecients
        };
    }
    set value(value) {
        if(value) {
            this.minValue = value.minValue;
            this.maxValue = value.maxValue;
            this.coeffecients = value.coeffecients;
        }
    }

    get saveValue() {
        return { 
            minValue: this.#minValueElement.saveValue,
            maxValue: this.#maxValueElement.saveValue,
            coeffecients: this.coeffecients
        };
    }

    set saveValue(saveValue) {
        if(saveValue) {
            this.#minValueElement.saveValue = saveValue.minValue;
            this.#maxValueElement.saveValue = saveValue.maxValue;
            this.coeffecients = saveValue.coeffecients;
        }
    }

    GetObjOperation(result, inputVariableId) {
        let obj = this.value;
        obj.type = "Calculation_Polynomial";
        obj.result = result;
        obj.inputVariables = [ inputVariableId ]; 

        return obj;
    }

    #toDisplayValue(value, index) {
        //todo
        const unit = Measurements[this.measurementName]?.[this.measurementUnitName];
        return value;
    }
    #toBaseValue(value, index) {
        //todo
        const unit = Measurements[this.measurementName]?.[this.measurementUnitName];
        return value;
    }
}
customElements.define('ui-polynomial', Calculation_Polynomial, { extends: `span` });
GenericConfigs.push(Calculation_Polynomial);