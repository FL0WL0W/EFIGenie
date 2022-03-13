export default class UICheckBox extends HTMLInputElement {
    onChange = [];

    get value() {
        return this.checked;
    }
    set value(value) {
        if(this.checked === value)
            return;

        this.checked = value;
        super.dispatchEvent(new Event(`change`));
    }

    get saveValue() {
        return this.value;
    }
    set saveValue(saveValue){
        this.value = saveValue;
    }

    constructor(prop) {
        super();
        this.type = `checkbox`;
        this.class = `ui checkbox`;
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        const thisClass = this;
        this.addEventListener(`change`, function() {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });
    }
}
customElements.define('ui-checkbox', UICheckBox, { extends: 'input' });