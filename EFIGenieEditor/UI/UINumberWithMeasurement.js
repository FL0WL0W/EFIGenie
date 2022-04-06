import UITemplate from "../JavascriptUI/UITemplate.js"
import UINumber from "../JavascriptUI/UINumber.js"
import UIMeasurement from "./UIMeasurement.js"
export default class UINumberWithMeasurement extends UITemplate {
    static Template = `<div data-element="DisplayValue"></div><div data-element="DisplayMeasurement"></div>`

    get MeasurementUnitName() {
        return this.DisplayMeasurement.value;
    }
    set MeasurementUnitName(measurementUnitName) {
        if(measurementUnitName === undefined || this.DisplayMeasurement.value === measurementUnitName)
            return;

        this.DisplayMeasurement.value = measurementUnitName;
        this.UpdateDisplayValue();
    }

    get Measurement() {
        return this.DisplayMeasurement.Measurement;
    }
    set Measurement(measurement) {
        if(this.DisplayMeasurement.Measurement === measurement)
            return;

        this.DisplayMeasurement.Measurement = measurement;
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
        return GetUnit(this.Measurement, this.MeasurementUnitName)
    }

    constructor(prop) {
        super();
        const thisClass = this;
        this.DisplayMeasurement = new UIMeasurement({
            Measurement : prop?.Measurement,
            value: prop?.MeasurementUnitName,
        });
        this.DisplayMeasurement.addEventListener(`change`, function() {
            thisClass.UpdateDisplayValue();
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.DisplayValue = new UINumber();
        this.DisplayValue.addEventListener(`change`, function() {
            if(thisClass.DisplayValue.Value !== undefined && thisClass.Unit)
                thisClass.Value = (thisClass.DisplayValue.Value -  thisClass.Unit.DisplayOffset) / thisClass.Unit.DisplayMultiplier;
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.DisplayValue.GUID = this.GUID;
        this.Setup(prop);
    }

    get saveValue() {
        if(this.DisplayMeasurement.saveValue === undefined)
            return this.value;

        return {
            MeasurementUnitName: this.DisplayMeasurement.saveValue,
            Value: this.value
        };
    }
    set saveValue(saveValue){
        if(typeof saveValue === `object`) {
            this.DisplayMeasurement.saveValue = saveValue?.MeasurementUnitName;
            this.value = saveValue?.Value;
        } else {
            this.value = saveValue;
        }
    }

    UpdateDisplayValue() {
        const displayValue = this.ValueToDisplayValue(this.value);
        if(displayValue !== undefined)
            this.DisplayValue.Value = displayValue;
        const displayMin = this.ValueToDisplayValue(this.min);
        if(displayMin !== undefined)
            this.DisplayValue.min = displayMin;
        const displayMax = this.ValueToDisplayValue(this.max);
        if(displayMax !== undefined)
            this.DisplayValue.max = displayMax;
        const displayStep = this.ValueToDisplayValue(this.step);
        if(displayStep !== undefined)
            this.DisplayValue.step = displayStep;
    }

    ValueToDisplayValue(value) {
        if(value !== undefined && this.Unit)
            return value * this.Unit.DisplayMultiplier + this.Unit.DisplayOffset;
    }
}
customElements.define(`ui-numberwithmeasurement`, UINumberWithMeasurement, { extends: `span` });