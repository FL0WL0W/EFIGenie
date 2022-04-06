import UISelection from "../JavascriptUI/UISelection.js"
export default class UIMeasurement extends UISelection {
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