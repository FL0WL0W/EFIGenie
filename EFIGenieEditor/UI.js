import UINumber from "./JavascriptUI/UINumber.js"
import UICheckBox from "./JavascriptUI/UICheckBox.js";
import UIText from "./JavascriptUI/UIText.js";
import UISelection from "./JavascriptUI/UISelection.js";
import UITemplate from "./JavascriptUI/UITemplate.js";
import UITable from "./JavascriptUI/UITable.js";
import UIGraph3D from "./JavascriptUI/UIGraph3D.js"
import UIGraph2D from "./JavascriptUI/UIGraph2D.js"
import UIDialog from "./JavascriptUI/UIDialog.js"
import UIButton from "./JavascriptUI/UIButton.js"

//adapt new ui modules
Object.defineProperty(HTMLElement.prototype, 'Class', {
    enumerable: true,
    set: function(pclass) {
        this.class = pclass;
    }
});
Object.defineProperty(HTMLElement.prototype, 'Value', {
    enumerable: true,
    get: function() {
        return this.value;
    },
    set: function(value) {
        this.value = value;
    }
});

class UIMeasurement extends UISelection {
    _hidden = false;
    get hidden() {
        return this._hidden;
    }
    set hidden(hidden) {
        this._hidden = hidden;
        if(hidden || this.options.length === 0) {
            super.hidden = true;
        } else {
            super.hidden = false;
        }
    }

    _measurement;
    get Measurement() {
        return this._measurement;
    }
    set Measurement(measurement){
        if(!measurement)
            return;

        this._measurement = measurement;
        this.Default = Measurements[measurement]?.[GetDefaultUnitIndex(measurement)]?.Name;
        this.options = Measurements[measurement]?.map(unit => { return { Name: unit.Name, Value: unit.Name }; })
        if(this.value === undefined || this.value === `` || this.value === null) 
            this.value = this.Default;
        if(this.options.length === 0)
            super.hidden = true;
        else if(!this.hidden)
            super.hidden = false;
    }

    get saveValue() {
        if(this.value === this.Default)
            return;
        return super.saveValue;
    }
    set saveValue(saveValue) {
        if(saveValue === undefined || saveValue === ``)
            return;
        super.saveValue = saveValue;
    }

    constructor(prop) {
        super(prop);
        if(prop?.Measurement && prop?.value !== undefined) {
            this.Default = this.value;
        }
        this.class = `ui measurement`;
        this.selectNotVisible = true;
    }
}
customElements.define(`ui-measurement`, UIMeasurement, { extends: `div` });

class NumberWithMeasurement extends UITemplate {
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
        if(this.DisplayMeasurement.Measurement == measurement)
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
customElements.define(`ui-numberwithmeasurement`, NumberWithMeasurement, { extends: `div` });

class DisplayNumberWithMeasurement extends UITemplate {
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
customElements.define(`ui-displaynumberwithmeasurement`, DisplayNumberWithMeasurement, { extends: `div` });

export default { UI: {
    Template: UITemplate,
    Number: UINumber,
    CheckBox: UICheckBox,
    Text: UIText,
    Selection: UISelection,
    NumberWithMeasurement : NumberWithMeasurement,
    Table: UITable,
    Graph3D: UIGraph3D,
    Graph2D: UIGraph2D,
    Dialog: UIDialog,
    DisplayNumberWithMeasurement,
    Button: UIButton
}}