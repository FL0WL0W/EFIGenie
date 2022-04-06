import UITemplate from "../JavascriptUI/UITemplate.js"
import UIMeasurement from "./UIMeasurement.js"
export default class UIDisplayNumberWithMeasurement extends UITemplate {
    static Template = `<div data-element="displayValue"></div><div data-element="displayMeasurement"></div>`

    get measurementUnitName() {
        return this.displayMeasurement.value;
    }
    set measurementUnitName(measurementUnitName) {
        this.displayMeasurement.value = measurementUnitName;
        this.UpdateDisplayValue();
    }

    get measurementName() {
        return this.displayMeasurement.measurementName;
    }
    set measurementName(measurementName) {
        this.displayMeasurement.measurementName = measurementName;
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
        this.displayMeasurement = new UIMeasurement({
            measurementName : prop?.measurementName,
            value: prop?.measurementUnitName
        });
        this.displayMeasurement.addEventListener(`change`, function() {
            thisClass.ZeroesToAdd = 10000000;
            thisClass.UpdateDisplayValue();
            thisClass.dispatchEvent(new Event(`change`, {bubbles: true}));
        });
        this.displayValue = document.createElement(`div`);
        this.displayValue.style.display = this.displayMeasurement.style.display = `inline-block`;
        
        this.Setup(prop);
        this.ZeroesToAdd = 10000000;
    }

    get saveValue() {
        return this.displayMeasurement.saveValue;
    }
    set saveValue(saveValue) {
        this.displayMeasurement.saveValue = saveValue;
    }

    UpdateDisplayValue() {
        let unit = GetUnit(this.measurementName, this.measurementUnitName)
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

        this.displayValue.textContent = displayValue;
    }
}
customElements.define(`ui-displaynumberwithmeasurement`, UIDisplayNumberWithMeasurement, { extends: `span` });