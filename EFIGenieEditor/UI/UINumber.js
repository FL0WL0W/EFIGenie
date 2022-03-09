import UIElement from "./UIElement.js"
export default class UINumber extends UIElement {
    element = document.createElement(`input`);
    onChange = [];

    get min() {
        return this.element.min;
    }
    set min(min) {
        if(this.element.min === min)
            return;

        this.element.min = min;
    }

    get max() {
        return this.element.max;
    }
    set max(max) {
        if(this.element.max === max)
            return;

        this.element.max = max;
    }

    get step() {
        return this.element.step;
    }
    set step(step) {
        if(this.element.step === step)
            return;

        this.element.step = step;
    }

    get value() {
        return parseFloat(this.element.value);
    }
    set value(value) {
        value = parseFloat(value);
        if(parseFloat(this.element.value) === value)
            return;

        this.element.value = value;
        this.onChange.forEach(function(onChange) { onChange(); });
    }

    get saveValue() {
        return this.value;
    }
    set saveValue(saveValue){
        this.value = saveValue;
    }

    constructor(prop) {
        super();
        this.element.type = `number`;
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        const thisClass = this;
        this.element.addEventListener(`change`, function(event) {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });
    }
}