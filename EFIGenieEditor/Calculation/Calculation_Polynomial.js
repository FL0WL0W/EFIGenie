import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
import UINumber from "../JavascriptUI/UINumber.js";
//this still needs some complicated unit work. this is ok for now
export default class Calculation_Polynomial extends HTMLSpanElement {
    static Name = `Polynomial`;
    static Output = `float`;
    static Inputs = [`float`];

    get Measurement() {
        return this.#valueElement.firstChild.Measurement;
    }
    set Measurement(measurement) {
        this.#valueElement.firstChild.Measurement = measurement;
    }

    get MeasurementUnitName() {
        return this.#valueElement.firstChild.MeasurementUnitName;
    }
    set MeasurementUnitName(measurementUnitName) {
        this.#valueElement.firstChild.MeasurementUnitName = measurementUnitName;
    }

    #valueElement = document.createElement(`div`);
    get value() {
        const thisClass = this;
        return [...this.#valueElement.children].map(function(element, index) { return thisClass.#toBaseValue(element.value, index); });
    }
    set value(value) {
        this.degree = value.length;
        for(let i = 0; i < this.#valueElement.children.length; i++) {
            this.#valueElement.children[i].value = this.#toDisplayValue(value[i], i);
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
        this.#minValueElement.DisplayMeasurement.hidden = true;
        this.append(this.#minValueElement);
        this.append(document.createElement(`br`));
        const maxValueLabel = document.createElement(`label`);
        this.append(maxValueLabel);
        this.#maxValueElement.DisplayMeasurement.hidden = true;
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
            while(thisClass.#valueElement.children.length > thisClass.degree) { thisClass.#valueElement.removeChild(thisClass.#valueElement.lastChild); }
            for(let i = thisClass.#valueElement.children.length; i < thisClass.degree; i++) {
                let valueElement = thisClass.#valueElement.appendChild(document.createElement(`div`));
                let number = valueElement.appendChild(i === 0? new UINumberWithMeasurement({ value: 0 }) : new UINumber({ value: 0 }));
                if(i !== 0) {
                    let label = valueElement.appendChild(document.createElement(`span`));
                    label.innerHTML = `x<sup>${i}</sup> +`;
                } else {

                    number.addEventListener(`change`, function() { valueElement.dispatchEvent(new Event(`change`, {bubbles: true})); });
                }
                valueElement.style.display = `inline`;
                Object.defineProperty(valueElement, 'value', {
                    get: function() { return this.firstChild.value; },
                    set: function(value) { this.firstChild.value = value }
                });
                Object.defineProperty(valueElement, 'Measurement', {
                    get: function() { return this.firstChild.Measurement; },
                    set: function(value) { this.firstChild.Measurement = value }
                });
                Object.defineProperty(valueElement, 'MeasurementUnitName', {
                    get: function() { return this.firstChild.MeasurementUnitName; },
                    set: function(value) { this.firstChild.MeasurementUnitName = value }
                });
            }
        });
        this.degree = 2;
        this.append(this.#valueElement);
        this.#valueElement.style.display = `flex`;
        this.#valueElement.style.flexDirection = `row-reverse`;
        this.#valueElement.style.alignItems = `flex-start`;
        this.#valueElement.style.justifyContent = `flex-end`;
        this.#valueElement.firstChild.addEventListener(`change`, function() {
            //convert value
            thisClass.#minValueElement.Measurement = thisClass.Measurement;
            thisClass.#maxValueElement.Measurement = thisClass.Measurement;
            thisClass.#minValueElement.MeasurementUnitName = thisClass.MeasurementUnitName;
            thisClass.#maxValueElement.MeasurementUnitName = thisClass.MeasurementUnitName;
        });
        Object.assign(this, prop);
    }

    get saveValue() {
        return { 
            MinValue: this.minValue,
            MaxValue: this.maxValue,
            A: this.value
        };
    }

    set saveValue(saveValue) {
        if(saveValue) {
            this.minValue = saveValue.MinValue;
            this.maxValue = saveValue.MaxValue;
            this.value = saveValue.A;
        }
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: `FLOAT`, value: this.minValue}, //MinValue
            { type: `FLOAT`, value: this.maxValue}, //MaxValue
            { type: `UINT8`, value: this.degree}, //Degree
            { type: `FLOAT`, value: this.value}, //coefficients
        ]};

        if (outputVariableId || inputVariableId) 
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables: [ inputVariableId ?? 0 ]
            });

        return obj;
    }

    #toDisplayValue(value, index) {
        //todo
        const unit = Measurements[this.Measurement]?.[this.MeasurementUnitName];
        return value;
    }
    #toBaseValue(value, index) {
        //todo
        const unit = Measurements[this.Measurement]?.[this.MeasurementUnitName];
        return value;
    }
}
customElements.define('ui-polynomial', Calculation_Polynomial, { extends: `span` });
GenericConfigs.push(Calculation_Polynomial);