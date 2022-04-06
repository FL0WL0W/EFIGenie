import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumber from "../JavascriptUI/UINumber.js"
import UIMeasurement from "./UIMeasurement.js"
export default class UINumberWithMeasurement extends UITemplate {
    static Template = `<div data-element="DisplayValue"></div><div data-element="displayMeasurement"></div>`

    get measurementUnitName() {
        return this.displayMeasurement.value;
    }
    set measurementUnitName(measurementUnitName) {
        if(measurementUnitName === undefined || this.displayMeasurement.value === measurementUnitName)
            return;

        this.displayMeasurement.value = measurementUnitName;
        this.UpdateDisplayValue();
    }

    get measurementName() {
        return this.displayMeasurement.measurementName;
    }
    set measurementName(measurementName) {
        if(this.displayMeasurement.measurementName === measurementName)
            return;

        this.displayMeasurement.measurementName = measurementName;
        this.UpdateDisplayValue();
    }

    set class(pclass) {
        this.DisplayValue.class = pclass;
    }

    #min = undefined;
    get min() {
        return this.#min;
    }
    set min(min) {
        if(this.#min === min)
            return;

        this.#min = min;
        this.UpdateDisplayValue();
    }

    #max = undefined;
    get max() {
        return this.#max;
    }
    set max(max) {
        if(this.#max === max)
            return;

        this.#max = max;
        this.UpdateDisplayValue();
    }

    #step = undefined;
    get step() {
        return this.#step;
    }
    set step(step) {
        if(this.#step === step)
            return;

        this.#step = step;
        this.UpdateDisplayValue();
    }

    #value;
    get value() {
        return this.#value;
    }
    set value(value) {
        if(this.#value === value)
            return;

        this.#value = value;
        this.UpdateDisplayValue();
    }

    get Unit() {
        return GetUnit(this.measurementName, this.measurementUnitName)
    }

    constructor(prop) {
        super();
        const thisClass = this;
        this.displayMeasurement = new UIMeasurement({
            measurementName : prop?.measurementName,
            value: prop?.measurementUnitName,
        });
        this.displayMeasurement.addEventListener(`change`, function() {
            thisClass.UpdateDisplayValue();
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.DisplayValue = new UINumber();
        this.DisplayValue.addEventListener(`change`, function() {
            if(thisClass.DisplayValue.value !== undefined && thisClass.Unit)
                thisClass.value = (thisClass.DisplayValue.value -  thisClass.Unit.DisplayOffset) / thisClass.Unit.DisplayMultiplier;
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.DisplayValue.GUID = this.GUID;
        this.Setup(prop);
    }

    get saveValue() {
        if(this.displayMeasurement.saveValue === undefined)
            return this.value;

        return {
            measurementUnitName: this.displayMeasurement.saveValue,
            value: this.value
        };
    }
    set saveValue(saveValue){
        if(typeof saveValue === `object`) {
            this.displayMeasurement.saveValue = saveValue.measurementUnitName ?? saveValue.measurementUnitName;
            this.value = saveValue.value ?? saveValue.value;
        } else {
            this.value = saveValue;
        }
    }

    UpdateDisplayValue() {
        const displayValue = this.#valueToDisplayValue(this.value);
        if(displayValue !== undefined)
            this.DisplayValue.value = displayValue;
        const displayMin = this.#valueToDisplayValue(this.min);
        if(displayMin !== undefined)
            this.DisplayValue.min = displayMin;
        const displayMax = this.#valueToDisplayValue(this.max);
        if(displayMax !== undefined)
            this.DisplayValue.max = displayMax;
        const displayStep = this.#valueToDisplayValue(this.step);
        if(displayStep !== undefined)
            this.DisplayValue.step = displayStep;
    }

    #valueToDisplayValue(value) {
        if(value !== undefined && this.Unit)
            return value * this.Unit.DisplayMultiplier + this.Unit.DisplayOffset;
    }
}
customElements.define(`ui-numberwithmeasurement`, UINumberWithMeasurement, { extends: `span` });