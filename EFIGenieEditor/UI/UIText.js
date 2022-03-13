export default class UIText extends HTMLInputElement {
    onChange = [];

    get value() {
        return super.value;
    }
    set value(value) {
        if(super.value === value)
            return;

        super.value = value;
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
        this.class = `ui text`;
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        const thisClass = this;
        this.addEventListener(`change`, function() {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });
    }
}
customElements.define('ui-text', UIText, { extends: 'input' });