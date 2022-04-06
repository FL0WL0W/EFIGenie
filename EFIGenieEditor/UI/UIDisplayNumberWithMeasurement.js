import UITemplate from "../JavascriptUI/UITemplate.js"
import UIMeasurement from "./UIMeasurement.js"
export default class UIDisplayNumberWithMeasurement extends UITemplate {
    static Template = `<div data-element="DisplayValue"></div><div data-element="DisplayMeasurement"></div>`

    get MeasurementUnitName() {
        return this.DisplayMeasurement.value;
    }
    set MeasurementUnitName(measurementUnitName) {
        this.DisplayMeasurement.value = measurementUnitName;
        this.UpdateDisplayValue();
    }

    get Measurement() {
        return this.DisplayMeasurement.Measurement;
    }
    set Measurement(measurement) {
        this.DisplayMeasurement.Measurement = measurement;
        this.UpdateDisplayValue();
    }

    #value;
    get value() {
        return this.#value;
    }
    set value(value) {
        this.#value = value;
        this.UpdateDisplayValue();
    }

    constructor(prop) {
        super();
        const thisClass = this;
        this.DisplayMeasurement = new UIMeasurement({
            Measurement : prop?.Measurement,
            value: prop?.MeasurementUnitName
        });
        this.DisplayMeasurement.addEventListener(`change`, function() {
            thisClass.ZeroesToAdd = 10000000;
            thisClass.UpdateDisplayValue();
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.DisplayValue = document.createElement(`div`);
        this.DisplayValue.style.display = this.DisplayMeasurement.style.display = `inline-block`;
        
        this.Setup(prop);
        this.ZeroesToAdd = 10000000;
    }

    get saveValue() {
        return this.DisplayMeasurement.saveValue;
    }
    set saveValue(saveValue) {
        this.DisplayMeasurement.saveValue = saveValue;
    }

    UpdateDisplayValue() {
        let unit = GetUnit(this.Measurement, this.MeasurementUnitName)
        if(!unit) 
            unit = { DisplayMultiplier: 1, DisplayOffset: 0};
            
        let displayValue = this.value * unit.DisplayMultiplier + unit.DisplayOffset;
        displayValue = `${parseFloat(parseFloat(parseFloat(displayValue).toFixed(5)).toPrecision(6))}`;
        const indexOfPoint = displayValue.indexOf(`.`);
        var zeroesToAdd = 6-(displayValue.length - indexOfPoint);
        if(indexOfPoint === -1)
            zeroesToAdd = 6;
        if(zeroesToAdd < this.ZeroesToAdd)
            this.ZeroesToAdd = zeroesToAdd;
        zeroesToAdd -= this.ZeroesToAdd;
        for(var i = 0; i < zeroesToAdd; i++)
            displayValue += `0`;

        this.DisplayValue.textContent = displayValue;
    }
}
customElements.define(`ui-displaynumberwithmeasurement`, UIDisplayNumberWithMeasurement, { extends: `span` });