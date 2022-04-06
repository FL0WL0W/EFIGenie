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

    _measurementName;
    get measurementName() {
        return this._measurementName;
    }
    set measurementName(measurementName){
        if(!measurementName)
            return;

        this._measurementName = measurementName;
        this.Default = Measurements[measurementName]?.[GetDefaultUnitIndex(measurementName)]?.name;
        this.options = Measurements[measurementName]?.map(unit => { return { name: unit.name, value: unit.name }; })
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
        if(prop?.measurementName && prop?.value !== undefined) {
            this.Default = this.value;
        }
        this.class = `ui measurement`;
        this.selectNotVisible = true;
    }
}
customElements.define(`ui-measurement`, UIMeasurement, { extends: `div` });