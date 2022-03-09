import UIElement from "./UIElement.js"
export default class UICheckbox extends UIElement {
    element = document.createElement(`input`);
    onChange = [];

    get value() {
        return this.element.checked;
    }
    set value(value) {
        if(this.element.checked === value)
            return;

        this.element.checked = value;
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
        this.element.type = `checkbox`;
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        const thisClass = this;
        this.element.addEventListener(`change`, function() {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });
    }
}