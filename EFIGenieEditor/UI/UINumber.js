export default class UINumber extends HTMLInputElement {
    onChange = [];

    get value() {
        return parseFloat(super.value);
    }
    set value(value) {
        value = parseFloat(value);
        if(parseFloat(super.value) === value)
            return;

        super.value = value;
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
        this.type = `number`;
        this.class = `ui number`;
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        const thisClass = this;
        this.addEventListener(`change`, function() {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });
    }
}
customElements.define('ui-number', UINumber, { extends: 'input' });