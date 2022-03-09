import UIElement from "./UIElement.js"
export default class UIText extends UIElement {
    onChange = [];

    get value() {
        return this.element.value;
    }
    set value(value) {
        if(this.element.value === value)
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
        super(`input`);
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        const thisClass = this;
        this.element.addEventListener(`change`, function() {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });
    }
}